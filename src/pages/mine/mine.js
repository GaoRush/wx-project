'use strict';
const config = require('../../assets/js/config.js');
const common = require('../../assets/js/common.js');
const login = require('../../assets/js/login02.js');
const http = require('../../assets/js/http.js');
const app = getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '会员中心'
    },
    userInfo: {},
    isLogin: false,
    // 订单
    order: "",
    // 团购订单
    group_buying_order: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    // let that = this
    // // 获取自定义导航的整体高度
    // that.setData({
    //   statusBar_height: that.selectComponent('#statusBar')
    // })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    let that = this
    // let userInfo = wx.getStorageSync('s_userInfo')
    // let isLogin = wx.getStorageSync('s_isLogin')
    // let sKey = wx.getStorageSync('s_sKey')
    // console.log('每次打开页面检查是否登录', that.data)

    // 先判断是否存在用户信息
    // if (JSON.stringify(userInfo) != '' && isLogin && sKey) {
    //   //有用户信息，直接执行下面的数据请求
    //   // console.log('有用户信息，直接执行下面的数据请求')

    //   // ....
    //   that.setData({
    //     userInfo: userInfo,
    //     isLogin: isLogin,
    //     userInfo_str: JSON.stringify(userInfo)
    //   })

    //   // 用户中心
    //   that.user_center()
    // } else {
    //   // 没有用户信息，先获取用户信息
    //   // console.log('没有用户信息，先获取用户信息')

    //   // 更新用户信息
    //   // that.update_userInfo()

    //   // 用户中心
    //   that.user_center()
    // }

    that.update_userInfo()
    that.user_center()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    let that = this

    console.log('下拉了')
    // 更新用户信息
    that.update_userInfo()

    wx.stopPullDownRefresh()

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},


  // 未授权情况下微信用户信息按钮授权登录
  // getUserInfo: function (e) {
  //   let that = this
  //   login.btn_getUserInfo(e).then((res) => {
  //     //更新/提交微信用户信息,可以执行获取
  //     // common.alert(res.msg, 'success')

  //     console.log('提交微信用户信息', res)

  //     login.update_getUserInfo().then((res02) => {
  //       that.setData({
  //         userInfo: res02.data,
  //         isLogin: true,
  //         userInfo_str: JSON.stringify(res02.data)
  //       })
  //       // 缓存更新用户信息
  //       wx.setStorageSync('s_userInfo', res02.data)
  //       wx.setStorageSync('s_isLogin', true)

  //       console.log('that.data', that.data)
  //     }).catch((err) => {
  //       common.alert(err)
  //     });

  //   }).catch((err) => {
  //     common.alert(err)
  //   });
  // },

  // 查看大图
  previewImage: function (e) {
    let that = this;
    wx.showLoading()

    let imgList = []

    if (that.data.userInfo.avatar_url && that.data.userInfo.avatar_url != 'undefined') {
      imgList.push(that.data.userInfo.avatar_url)
    } else {
      imgList.push('../../assets/images/user.jpg')
    }
    common.previewImage(e, imgList)
  },

  // <!-- 真机调试清缓存按钮 -->
  clearStorage: function () {
    try {
      wx.clearStorageSync();
      common.alert('已清缓存', 'success')
    } catch (e) {
      // Do something when catch error
    }
  },

  // 用户中心
  user_center: function () {
    let that = this
    if (that.data.userInfo.mobile && that.data.userInfo.mobile != '') {

      let mobile = that.data.userInfo.mobile
      console.log('mobile', mobile)
      mobile = common.hide_mobile(mobile)
      that.setData({
        [`userInfo.mobile`]: mobile
      })
    } else {
      common.alert('请绑定手机号码，以便获取短信通知')
    }

    // login.requestP_pro({
    //   url: `${config.postUrl}` + 'user_center',
    //   data: {}
    // }).then(res => {
    //   console.log('用户中心', res)
    //   that.setData({
    //     order: res.data.order,
    //     group_buying_order: res.data.group_buying_order,
    //     unread_message: res.data.unread_message
    //   })
    //   console.log('that.data', that.data)

    // }).catch(err => {
    //   common.alert(err)
    // });
    let data = {
      op: "用户中心"
    }
    http.fly_key.get(`${config.apiUrl}` + 'user_center', data).then(res => {
      console.log('用户中心res', res)
      if (res && res.length > 0) {
        that.setData({
          order: res.order,
          group_buying_order: res.group_buying_order,
          unread_message: res.unread_message
        })
      }
      console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });
  },
  // 获取手机号
  // getPhoneNumber: function (e) {
  //   let that = this
  //   console.log(e)
  //   let urlData = {
  //     encrypted_data: e.detail.encryptedData,
  //     iv: e.detail.iv,
  //   }
  //   login.requestP_pro({
  //     url: `${config.postUrl}` + 'user_mobile_edit',
  //     data: urlData
  //   }).then(res => {
  //     console.log('用户中心', res)
  //     common.alert(res.msg)
  //     // 更新用户信息
  //     that.update_userInfo()

  //   }).catch(err => {
  //     common.alert('授权失败，请重试')
  //   });
  // },
  // // 更新用户信息
  update_userInfo: function () {
    let that = this
    // login.update_getUserInfo().then((res02) => {
    //   console.log('返回的用户信息', res02)
    //   if (res02) {
    //     // common.alert('登录成功！', 'sucess')

    //     that.setData({
    //       userInfo: res02.data,
    //       isLogin: true,
    //       userInfo_str: JSON.stringify(res02.data)
    //     })
    //     // 缓存更新用户信息
    //     wx.setStorageSync('s_userInfo', res02.data)
    //     wx.setStorageSync('s_isLogin', true)

    //     // 用户中心
    //     that.user_center()

    //   }

    // }).catch((err) => {
    //   common.showErr(err)
    //   // that.setData({
    //   //   isLogin: false,
    //   // })
    // });

    let data = {
      op: "用户信息"
    }
    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });

    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });
    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });

    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });

    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });
    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });

    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });

    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });
    http.fly_key.get(`${config.apiUrl}` + 'get_user_info', data).then(res => {
      console.log('用户信息res', res)
      if (res) {
        that.setData({
          userInfo: res.data.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res.data.data)
        })
      }
      // console.log('that.data', that.data)

    }).catch(err => {
      console.log(err)
    });


    http.fly.get(`${config.apiUrl}` + 'index').then(res => {
      console.log('index', res.data)


    }).catch(err => {
      console.log(err)
    });
  }
});