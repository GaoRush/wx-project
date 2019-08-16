'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
const app = getApp()

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '钱包记录'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    page_index: 1,
    page_size: 8,
    user_amount_log: [],
    isMore: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this
    // 获取钱包记录
    that.user_amount_log()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {

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
    console.log('下拉刷新')
    let that = this
    that.setData({
      page_index: 1,
      page_size: 8,
      user_amount_log: [],
      isMore: true,
    })
    that.user_amount_log();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {
    console.log('上拉了')
    let that = this
    // setTimeout模拟加载时间
    setTimeout(function () {
      that.loadMore();
    }, 500)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 获取钱包记录
  user_amount_log: function () {
    // 加载
    common.show_loading()

    let that = this
    let urlData = {
      page_index: that.data.page_index,
      page_size: that.data.page_size,
    }
    console.log('urlData', urlData)
    // 我的收藏列表
    login.requestP_pro({
      url: `${config.postUrl+'user_amount_log'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      // 停止加载
      common.stop_loading(500)

      // 加载更多:2 拼接新数据
      let old_list = that.data.user_amount_log
      let res_list = res.list
      // 时间格式处理
      if (res_list) {
        let list = res_list
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let add_time = common.date_time('date', item.add_time)
            list[i].add_time = add_time
          }
        }
      }
      let new_list = old_list.concat(res_list)
      // 加载更多:3 赋值
      that.setData({
        user_amount_log: new_list,
        page_index: res.page_index,
        page_size: res.page_size,
        total_count: res.total_count,
        isMore: true
      })
    }).catch((err) => {
      common.showErr(err)
    });
  },
  // 加载更多 4：加载更多
  loadMore: function () {
    let that = this
    let page_index = that.data.page_index;
    let page_size = that.data.page_size;
    let total_count = that.data.total_count
    let max_page_index = Math.ceil(total_count / page_size)
    if (total_count > 0) {
      page_index++
      if (page_index > max_page_index) {
        that.setData({
          page_index: page_index - 1,
          isMore: false
        })
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index)
        console.log("无法加载更多")
        common.alert('没有更多了')
        return false
      } else {
        that.setData({
          page_index: page_index,
          isMore: true
        })
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index)
        console.log("加载更多")
        // 获取列表
        that.user_amount_log()
      }
    }

  }
})