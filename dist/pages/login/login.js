'use strict';

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
      title: '广州多得服务'
    },
    url: config.url,
    imgUrl: config.imgUrl

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {},

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    common.getPage();
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
  // 未授权情况下微信用户信息按钮授权登录
  getUserInfo: function getUserInfo(e) {
    console.log(e);
    var that = this;
    login.btn_getUserInfo(e).then(function (res) {
      //更新/提交微信用户信息,可以执行获取
      // common.alert(res.msg, 'success')

      console.log('提交微信用户信息', res);

      login.update_getUserInfo().then(function (res02) {
        that.setData({
          userInfo: res02.data,
          isLogin: true,
          userInfo_str: JSON.stringify(res02.data)
        });
        // 缓存更新用户信息
        wx.setStorageSync('s_userInfo', res02.data);
        wx.setStorageSync('s_isLogin', true);

        console.log('that.data', that.data);

        // common.alert_back('授权成功', 'success')
        common.alert('授权成功', 'success');
        // console.log(common.getPage());
        var prevPage_data = common.getPage();
        console.log('prevPage_data', prevPage_data);

        // 产品详情分销
        if (prevPage_data.options.goodsId && prevPage_data.options.user_id) {
          wx.navigateTo({
            url: '' + ('../../' + prevPage_data.src + '?user_id=' + prevPage_data.options.user_id + '&goodsId=' + prevPage_data.options.goodsId)
          });
        } else if (prevPage_data.options.user_id) {
          // 首页分销
          wx.navigateTo({
            url: '' + ('../../' + prevPage_data.src + '?user_id=' + prevPage_data.options.user_id)
          });
        } else if (prevPage_data.options.coupon_token && prevPage_data.options.user_token) {
          // 优惠券转赠
          wx.navigateTo({
            url: '' + ('../../' + prevPage_data.src + '?coupon_token=' + prevPage_data.options.coupon_token + '&user_token=' + prevPage_data.options.user_token)
          });
        } else {
          wx.navigateTo({
            url: '../../pages/index/index'
          });
        }
      }).catch(function (err) {
        common.alert(err);
      });
    }).catch(function (err) {
      common.alert(err);
    });
  }
});