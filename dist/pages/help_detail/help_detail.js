'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

var WxParse = require('../../assets/wxParse/wxParse.js');

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '帮助中心'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    page_index: 1,
    page_size: 8,
    total_count: 0,
    rule_id: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;
    if (options.rule_id) {
      that.setData({
        rule_id: options.rule_id
      });
      // 获取分销规则详情
      that.distribution_rule_details();
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
  onReachBottom: function onReachBottom() {
    console.log('上拉了');
    var that = this;
    // setTimeout模拟加载时间
    setTimeout(function () {
      that.loadMore();
    }, 1000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 获取分销规则详情
  distribution_rule_details: function distribution_rule_details() {
    // 加载
    common.show_loading();

    var that = this;
    var urlData = {
      id: that.data.rule_id
    };
    console.log('urlData', urlData);
    // 获取分销规则详情

    login.requestP_pro({
      url: '' + (config.postUrl + 'distribution_rule_details'),
      data: urlData
    }, false).then(function (res) {
      console.log('res', res);
      // 加载
      common.stop_loading();

      that.setData(_defineProperty({
        rule_details: res.data
      }, 'statusBar.title', res.data.title));

      // 富文本
      var articleStr = that.data.rule_details.content;
      WxParse.wxParse('article', 'html', articleStr, that, 5);

      console.log('rule_details', that.data.rule_details);
    }).catch(function (err) {
      common.showErr(err);
    });
  }

});