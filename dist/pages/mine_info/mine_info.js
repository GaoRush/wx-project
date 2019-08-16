'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: ''
    },
    url: config.url,
    imgUrl: config.imgUrl,
    userInfo: {},
    sexArray: ['男', '女']
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    // let sKey = wx.getStorageSync('s_sKey');
    // app.globalData.sKey = sKey;
    var that = this;
    console.log('options', options);
    if (options.userInfo) {
      that.setData({
        userInfo: JSON.parse(options.userInfo)
      });
      console.log('that.data', that.data);
      // console.log('..app.globalData', app.globalData)
    } else {
      common.alert_back('加载出错，请重新登录');
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {},

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
  onPullDownRefresh: function onPullDownRefresh() {
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 昵称
  input_name: function input_name(e) {
    var that = this;
    console.log('正在输入', that.data);

    that.setData(_defineProperty({}, 'userInfo.nick_name', e.detail.value));

    console.log('that.data.userInfo.nick_name', that.data.userInfo.nick_name);
    common.checkUserName(that.data.userInfo.nick_name);
  },

  input_name_send: function input_name_send(e) {
    console.log(e);
    var that = this;
    if (that.data.userInfo.nick_name != '') {
      // 更新 / 提交微信用户信息
      that.editUserInfo();
    }
  },

  // 昵称
  bindInput: function bindInput(e) {
    console.log('e', e);

    var that = this;
    var name = e.currentTarget.dataset.name;

    if (name == 'mobile') {
      console.log('手机号码输入', name);
      that.setData(_defineProperty({}, 'userInfo.mobile', e.detail.value));
      var warn = common.checkPhoneNumber(that.data.address.mobile);
      if (warn) {
        // 更新 / 提交微信用户信息
        that.editUserInfo();
      }
    }
  },

  // 修改头像
  edit_headimg: function edit_headimg() {
    var that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function success(res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFiles = res.tempFiles;
        console.log('tempFiles', tempFiles);
        var path = tempFiles[0].path;
        common.show_loading('正在上传...');
        // 执行上传
        wx.uploadFile({
          url: config.uploadUrl,
          filePath: path,
          name: 'file',
          header: {
            'Content-Type': 'multipart/form-data'
          },
          formData: {
            douploadpic: '1'
          },
          success: function success(res) {
            console.log('上传头像', res);
            var data = res.data;
            var res_json = JSON.parse(res.data);

            // status==1，上传成功
            if (res_json.status == 1) {
              console.log('上传头像', res_json);
              var img = config.url + res_json.path;
              console.log('img', img);
              that.setData(_defineProperty({}, 'userInfo.avatar_url', img));
              console.log('that.data', that.data);

              // 更新 / 提交微信用户信息
              that.editUserInfo();
            } else {
              wx.showToast({
                title: '上传失败，请重试！',
                icon: 'none',
                mask: true
              });
              return false;
            }
          },
          fail: function fail(res) {
            wx.showToast({
              title: '网络错误，请重试！',
              icon: 'none',
              mask: true

            });
          },
          complete: function complete(res) {
            wx.hideLoading();
          }
        });
      }
    });
  },

  // 性别
  sexChange: function sexChange(e) {
    console.log(e);
    var that = this;
    console.log('parseInt(e.detail.value)', parseInt(e.detail.value));
    that.setData(_defineProperty({}, 'userInfo.sex', parseInt(e.detail.value) + 1));
    console.log('..22 that.data', that.data);
    console.log('..22app.globalData', app.globalData);

    // 更新 / 提交微信用户信息
    that.editUserInfo();
  },

  // 更新 / 提交微信用户信息
  editUserInfo: function editUserInfo() {
    var that = this;
    // 更新/提交微信用户信息
    login.userInfoEdit({
      url: '' + config.postUrl + 'user_info_edit',
      data: {
        nick_name: that.data.userInfo.nick_name,
        avatar_url: that.data.userInfo.avatar_url,
        gender: that.data.userInfo.sex,
        key: app.globalData.sKey
      }
    }).then(function (res) {

      // 获取用户信息
      login.update_getUserInfo().then(function (res02) {
        that.setData({
          userInfo: res02.data
        });

        // 提示更新成功
        common.alert('更新用户信息成功！');

        // 缓存更新用户信息
        wx.setStorageSync('s_userInfo', res02.data);
      }).catch(function (err) {
        common.alert(err);
      });
    }).catch(function (err) {
      common.alert(err);
    });
  },
  // 获取手机号
  getPhoneNumber: function getPhoneNumber(e) {
    var that = this;
    console.log(e);
    var urlData = {
      encrypted_data: e.detail.encryptedData,
      iv: e.detail.iv
    };
    login.requestP_pro({
      url: '' + config.postUrl + 'user_mobile_edit',
      data: urlData
    }).then(function (res) {
      console.log('用户中心', res);
      common.alert(res.msg);
      // 更新用户信息
      that.update_userInfo();
    }).catch(function (err) {
      common.alert('授权失败，请重试');
    });
  },
  // 更新用户信息
  update_userInfo: function update_userInfo() {
    var that = this;
    login.update_getUserInfo().then(function (res02) {
      console.log('返回的用户信息', res02);
      if (res02) {
        // common.alert('登录成功！', 'sucess')

        that.setData({
          userInfo: res02.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res02.data)
        });
        // 缓存更新用户信息
        wx.setStorageSync('s_userInfo', res02.data);
        wx.setStorageSync('s_isLogin', true);

        // // 用户中心
        // that.user_center()
      }
    }).catch(function (err) {
      common.showErr(err);
      // that.setData({
      //   isLogin: false,
      // })
    });
  }
});