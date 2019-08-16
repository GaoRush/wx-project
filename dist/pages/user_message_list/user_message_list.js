'use strict';

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
      title: '消息中心'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    page_index: 1,
    page_size: 8,
    total_count: 0,
    user_message_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;
    // 获取消息中心
    that.user_message_list();
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
    console.log('下拉刷新');
    var that = this;
    that.setData({
      page_index: 1,
      page_size: 8,
      user_message_list: [],
      isMore: true
    });
    that.user_message_list();
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
    }, 500);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 获取消息中心
  user_message_list: function user_message_list() {
    // 加载
    common.show_loading();

    var that = this;
    var urlData = {
      page_index: that.data.page_index,
      page_size: that.data.page_size
    };
    console.log('urlData', urlData);
    // 获取消息中心

    login.requestP_pro({
      url: '' + (config.postUrl + 'user_message_list'),
      data: urlData
    }).then(function (res) {
      console.log('res', res);
      // 加载
      common.stop_loading();

      // 加载更多:1判断有没更多数据
      // let user_message_list = that.data.user_message_list
      // let total_count = that.data.total_count
      // console.log('user_message_list', user_message_list.length)
      // console.log('total_count', total_count)
      // if (user_message_list.length > total_count) {
      //   that.setData({
      //     isMore: false
      //   })
      //   common.alert('没有更多了')
      //   return false;
      // }

      // 加载更多:2 拼接新数据
      var old_list = that.data.user_message_list;
      var res_list = res.list;
      // 时间格式处理
      if (res_list) {
        var _list = res_list;
        if (_list.length > 0) {
          for (var i = 0; i < _list.length; i++) {
            var item = _list[i];
            var time = common.date_time(item.post_time);
            _list[i].post_time = time;
          }
        }
      }
      var new_list = old_list.concat(res_list);
      console.log('old_list', old_list);
      console.log('res_list', res_list);
      console.log('new_list', new_list);

      // 加载更多:3 赋值
      that.setData({
        user_message_list: new_list,
        page_index: res.page_index,
        page_size: res.page_size,
        total_count: res.total_count,
        isMore: true
      });

      console.log('tha.data', that.data);

      // 多组数据富文本渲染
      var list = that.data.user_message_list;
      if (list.length > 0) {
        for (var _i = 0; _i < list.length; _i++) {
          // 富文本
          WxParse.wxParse('article' + _i, 'html', list[_i].content, that);
          if (_i === list.length - 1) {
            WxParse.wxParseTemArray("articleArray", 'article', list.length, that);
          }
        }
      }
    }).catch(function (err) {
      common.showErr(err);
    });
  },
  // 加载更多 4：加载更多
  loadMore: function loadMore() {
    var that = this;
    var page_index = that.data.page_index;
    var page_size = that.data.page_size;
    var total_count = that.data.total_count;
    var max_page_index = Math.ceil(total_count / page_size);
    if (total_count > 0) {
      page_index++;
      if (page_index > max_page_index) {
        that.setData({
          page_index: page_index - 1,
          isMore: false
        });
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index);
        console.log("无法加载更多");
        common.alert('没有更多了');
        return false;
      } else {
        that.setData({
          page_index: page_index,
          isMore: true
        });
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index);
        console.log("加载更多");
        // 获取消息中心
        that.user_message_list();
      }
    }
  }
});