'use strict';

var config = require('./config.js'); //引入配置文件
var common = require('./common.js');
var app = getApp();

var sKey = wx.getStorageSync('s_sKey');
var userInfo = wx.getStorageSync('s_userInfo');
var isLogin = wx.getStorageSync('s_isLogin');

/**
 * 登录失败/过期时清空旧缓存
 * 参数：
 * 返回值：[]
 */
function clearStorage() {
  sKey = '';
  userInfo = '';
  isLogin = '';
  wx.setStorageSync('s_sKey', '');
  wx.setStorageSync('s_userInfo', '');
  wx.setStorageSync('s_isLogin', '');
}

/**
 * 判断请求状态是否成功
 * 参数：http状态码
 * 返回值：[Boolen]
 */
function isHttpSuccess(status) {
  return status >= 200 && status < 300 || status === 304;
}

/**
 * promise请求
 * 参数：参考wx.request
 * 返回值：[promise]res
 */
function requestP() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var url = options.url,
      data = options.data,
      method = options.method,
      responseType = options.responseType,
      _success = options.success,
      _fail = options.fail,
      complete = options.complete;

  // 统一注入约定的header

  var header = Object.assign({
    Accept: 'application/json;charset=UTF-8'
  }, options.header);

  console.log('2.requestP接收到的参数', options);

  return new Promise(function (resolve, reject) {
    wx.request({
      url: url,
      data: data,
      success: function success(res) {
        var isSuccess = isHttpSuccess(res.statusCode);
        console.log('最原始返回的res', res);
        if (isSuccess) {
          //成功的请求状态
          if (_success) {
            _success(res.data);
          }

          if (res.data.status === 1) {
            //1后台返回成功
            resolve(res.data);
            console.log('3.request 成功返回，1', res.data);
          } else if (res.data.status === -1) {
            //-1后台判断未登录
            console.log('3.request 报错 未登录或超时，-1', res.data);
            common.alert(res.data.msg);
            resolve(res.data);
          } else if (res.data.status === -2) {
            //-2后台用户已被禁用
            console.log('3.request 报错 账号被禁用，-2 ', res.data);
            common.showErr(res.data.msg);
            return false;
          } else if (res.data.status === 0) {
            //0后台返回失败
            console.log('3.request 报错 返回失败，0 ', res.data);
            reject(res.data.msg);
          }
        } else {
          if (_fail) {
            _fail(res.data.msg);
          }
          reject(common.alert('\u7F51\u7EDC\u9519\u8BEF! code:' + res.statusCode));
        }
      },
      fail: function fail(err) {
        console.log('fail: err', err);
        if (_fail) {
          reject(common.alert('请求失败，请检查网络!'));
        }
        reject(common.alert('请求失败，请检查网络!'));
      },
      complete: complete
    });
  });
}

/**
 * 登录, 为了获取sKey
 * 参数：code
 * 返回值：data：s_key，is_register（0登录，1注册）
 */
function login() {
  return new Promise(function (resolve, reject) {
    // 登录,为了获取sKey
    console.log('1.发送登录请求wx.login,');
    common.show_loading('登录中...');
    wx.login({
      success: function success(res01) {
        console.log('2.成功返回并接收code', res01.code);

        if (res01.code) {
          requestP({
            url: config.postUrl + 'login',
            data: {
              code: res01.code
            }
          }).then(function (login_res) {
            console.log('3.成功返回接收并缓存/更新sKey和is_register:', login_res);
            wx.setStorageSync('s_sKey', login_res.data.s_key);
            wx.setStorageSync('is_register', login_res.data.is_register);
            sKey = login_res.data.s_key;
            console.log('更新sKey:' + sKey);

            if (login_res.data.is_register == 1) {
              console.log('新用户需要注册is_register==1,需要登录授权处理,跳转到登录页面');
              console.log('没有授权');
              // // 获取页面栈
              // let pages = getCurrentPages()
              // // 当前页面
              // let current_page = pages[pages.length - 1]
              // let info = prevPage.data //取上页data里的数据也可以修改

              var url = "../../pages/login/login";
              wx.navigateTo({
                url: url
              });
              // common.alert('请先授权登录')
              // //跳转到登录页面
              // let url = "../../pages/mine/mine"
              // common.alert_url('请先授权登录', url)
            } else {
              console.log('正常登录is_register==0,resolve 出去 sKey', login_res.data.s_key);
              // common.alert(login_res.msg, 'success', false)
              resolve(login_res.data.s_key);
            }
          }).catch(function (err) {
            console.log('login_err', err);
            reject(err);
          });
        }
      },
      complete: function complete() {
        // common.stop_loading()
      }
    });

    // 检查授权登录
    // wx.getSetting({
    //   success: res => {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 已经授权，可以直接调用 getUserInfo 获取头像昵称
    //       console.log('已经授权，可以直接调用 getUserInfo 获取头像昵称')
    //       // 必须是在用户已经授权的情况下调用
    //       wx.login({
    //         success: res01 => {
    //           console.log('2.成功返回并接收code', res01.code)

    //           if (res01.code) {
    //             requestP({
    //                 url: config.postUrl + 'login',
    //                 data: {
    //                   code: res01.code
    //                 }
    //               })
    //               .then(login_res => {
    //                 console.log('3.成功返回接收并缓存/更新sKey和is_register:', login_res)
    //                 wx.setStorageSync('s_sKey', login_res.data.s_key)
    //                 wx.setStorageSync('is_register', login_res.data.is_register)
    //                 sKey = login_res.data.s_key
    //                 console.log('更新sKey:' + sKey)

    //                 if (login_res.data.is_register == 1) {
    //                   console.log(
    //                     '新用户需要注册is_register==1,需要登录授权处理,跳转到登录页面'
    //                   )
    //                   common.alert('请先授权登录')
    //                   //跳转到登录页面
    //                   let url = "../../pages/mine/mine"
    //                   common.alert_url('请先授权登录', url)
    //                 } else {
    //                   console.log('正常登录is_register==0,resolve 出去 sKey', login_res.data.s_key)
    //                   // common.alert(login_res.msg, 'success', false)
    //                   resolve(login_res.data.s_key)
    //                 }
    //               })
    //               .catch(err => {
    //                 console.log('login_err', err)
    //                 reject(err)
    //               })
    //           }
    //         },
    //         complete() {
    //           // common.stop_loading()
    //         }
    //       })

    //     } else {
    //       console.log('没有授权')
    //       let url = "../../pages/login/login"
    //       wx.navigateTo({
    //         url: url
    //       })
    //       // reject()
    //     }
    //   }
    // })
  });
}

/**
 * 检查sKey的有效性
 * 参数：undefined
 * 返回值：[promise] sKey
 */
function getSKey() {

  return new Promise(function (resolve, reject) {
    console.log('getSKey 1.现在的sKey', sKey);
    if (!sKey) {
      //本地的sKey丢失,重新登录
      console.log('getSKey 2.本地的sKey丢失,重新登录');
      login().then(function (res_sKey) {
        console.log('getSKey 3.成功获取到sKey', res_sKey);
        resolve(res_sKey);
      }).catch(function (err) {
        reject(err);
      });
    } else {
      console.log('本地的sKey存在,直接返回sKey', sKey);
      // wx.setStorageSync('s_sKey', sKey)
      resolve(sKey);
    }
  });
}

/**
 * ajax高级封装
 * 参数：[Object]option = {}，参考wx.request；
 * [Boolen]needLogin = true 发送的请求默认需要带sKey
 * 返回值：[promise]res
 */
function requestP_pro() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var needLogin = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

  // needLogin==true,为已经登录状态下发送的请求
  console.log('needLogin', needLogin);
  if (needLogin === true) {
    console.log('默认请求必须带sKey');

    return new Promise(function (resolve, reject) {
      getSKey().then(function (res_sKey) {
        //获取sKey成功后,发起请求
        console.log('1.getSKey()获取sKey成功后,发起请求', res_sKey);
        options.data.key = res_sKey;
        // console.log('requestP_pro接收到的参数', options)
        requestP(options).then(function (res_requestP) {
          console.log('3.requestP_pro接收', res_requestP);

          if (res_requestP.status == -1) {
            // status = -1 登录状态无效，则重新走一遍登录流程
            // 销毁本地已失效的sKey
            // 登录失败的, 清空缓存sKey, isLogin
            clearStorage();
            console.log('status=-1,登录状态无效，则重新走一遍登录流程:1.销毁本地已失效的sKey' + 'sKey:' + sKey, 'userInfo:' + userInfo, 'isLogin:' + isLogin);
            // 重新获取sKey
            getSKey().then(function (news_sKey) {
              console.log('2.重新登录获得新的sKey,再次提交请求r3', news_sKey);
              // 更新参数里的sKey
              options.data.key = news_sKey;
              requestP(options).then(function (r4) {
                console.log('3.新请求成功返回的r4,resolve出去', r4);
                resolve(r4);
              }).catch(function (err) {
                console.log('3.新请求成功返回的错误,reject出去', err);
                reject(err);
              });
            });
          } else {
            console.log("4.请求成功，=1，resolve");
            resolve(res_requestP);
          }
        }).catch(function (err) {
          console.log('4.requestP_pro接受返回的err', err);
          reject(err);
        });
      }).catch(function (err) {
        reject(err);
      });
    });
  } else if (needLogin == 'optional') {
    console.log('1.optional ，请求非必须带sKey');
    var _sKey = wx.getStorageSync('s_sKey');
    // let isLogin = wx.getStorageSync('s_isLogin')
    // 如果登录
    if (_sKey != '') {
      console.log('2.当前已经登录,走需要sKey的请求流程');

      return new Promise(function (resolve, reject) {
        getSKey().then(function (res_sKey) {
          //获取sKey成功后,发起请求
          console.log('1.getSKey()获取sKey成功后,发起请求', res_sKey);
          options.data.key = res_sKey;
          // console.log('requestP_pro接收到的参数', options)
          requestP(options).then(function (res_requestP) {
            console.log('3.requestP_pro接收', res_requestP);

            if (res_requestP.status == -1) {
              // status = -1 登录状态无效，则重新走一遍登录流程
              // 销毁本地已失效的sKey
              // 登录失败的, 清空缓存sKey, isLogin
              clearStorage();
              console.log('status=-1,登录状态无效，则重新走一遍登录流程:1.销毁本地已失效的sKey' + 'sKey:' + _sKey, 'userInfo:' + userInfo, 'isLogin:' + isLogin);
              // 重新获取sKey
              getSKey().then(function (news_sKey) {
                console.log('2.重新登录获得新的sKey,再次提交请求r3', news_sKey);
                // 更新参数里的sKey
                options.data.key = news_sKey;
                requestP(options).then(function (r4) {
                  console.log('3.新请求成功返回的r4,resolve出去', r4);
                  resolve(r4);
                }).catch(function (err) {
                  console.log('3.新请求成功返回的错误,reject出去', err);
                  reject(err);
                });
              });
            } else {
              console.log("4.请求成功，=1，resolve");
              resolve(res_requestP);
            }
          }).catch(function (err) {
            console.log('4.requestP_pro接受返回的err', err);
            reject(err);
          });
        }).catch(function (err) {
          reject(err);
        });
      });
    } else {
      console.log('3.当前没有登录,走无sKey的请求流程');
      return requestP(options);
    }
  } else if (needLogin === false) {
    //不需要登录(skey),直接发起请求
    console.log('不需要登录(skey),直接发起请求');
    return requestP(options);
  }
}

// 更新/提交微信用户信息
function userInfoEdit() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  return new Promise(function (resolve, reject) {
    console.log('接收到的微信用户信息', options);
    requestP_pro(options).then(function (res) {
      console.log('更新/提交微信用户信息', res);
      resolve(res);
    }).catch(function (err) {
      reject(err);
    });
  });
}

// 获取用户信息
function update_getUserInfo() {
  // common.show_loading('')
  return new Promise(function (resolve, reject) {
    requestP_pro({
      url: '' + config.postUrl + 'get_user_info',
      data: {
        key: sKey
      }
    }).then(function (res) {
      console.log('获取用户信息', res);
      resolve(res);
      // common.stop_loading(0)
    }).catch(function (err) {
      reject(err);
    });
  });
}

// 1. 未授权情况下微信用户信息按钮授权登录
function btn_getUserInfo(e) {
  return new Promise(function (resolve, reject) {
    if (e.detail.userInfo) {
      // 因为Login流程中有wx.getUserInfo，此时就可以获取到了
      // console.log('点击授权', e.detail.userInfo)
      // 缓存更新用户信息
      wx.setStorageSync('s_userInfo', e.detail.userInfo);
      wx.setStorageSync('s_isLogin', true);

      console.log('点击授权获取了微信用户信息,更新到服务器', e.detail.userInfo);
      userInfoEdit({
        url: '' + config.postUrl + 'user_info_edit',
        data: {
          nick_name: e.detail.userInfo.nickName,
          avatar_url: e.detail.userInfo.avatarUrl,
          gender: e.detail.userInfo.gender,
          key: sKey
        }
      }).then(function (res) {
        resolve(res);
      }).catch(function (err) {
        reject(err);
      });
    } else {
      console.log('不授权,不授权清空用户信息');
      // 获取用户信息失败，清空全局存储的登录状态，弹窗提示一键登录
      // 更新缓存用户信息
      wx.setStorageSync('s_userInfo', '');
      wx.setStorageSync('s_isLogin', false);
      common.showErr('您已拒绝授权,请再次授权登录');
      reject();
    }
  });
}

// 用户中心信息，用来判断是否授权登录
function user_center() {
  return new Promise(function (resolve, reject) {
    requestP_pro({
      url: '' + config.postUrl + 'user_center',
      data: {
        key: sKey
      }
    }).then(function (res) {
      console.log('检查用户是否需要授权登录', res);

      if (res.data.nick_name == '') {
        console.log('用户中心信息不存在，请授权登录', res);
        var msg = '请授权登录';
        var url = "../../pages/login/login";
        common.alert_url(msg, 'none', true, url);
      }
      resolve(res);
    }).catch(function (err) {
      reject(err);
    });
  });
}

module.exports = {
  requestP: requestP,
  login: login,
  requestP_pro: requestP_pro,
  sKey: sKey,
  getSKey: getSKey,
  btn_getUserInfo: btn_getUserInfo,
  update_getUserInfo: update_getUserInfo,
  userInfoEdit: userInfoEdit,
  user_center: user_center
  // getUserInfo: getUserInfo,
};