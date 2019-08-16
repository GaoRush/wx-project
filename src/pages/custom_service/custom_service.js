'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '客服服务'
    },
    url: config.url,
    imgUrl: config.imgUrl,

    // 自定义返回路径
    navToUrl: "",
    fromOrder: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this
    // 来自线下支付提交订单
    if (options.fromOrder && options.fromOrder == 'true') {
      console.log("从下单页面进入")
      that.setData({
        navToUrl: "../../pages/mine/mine",
        fromOrder: true
      })
    }
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

  // 电话咨询
  bindCall: function () {
    let phoneNumber = '15012410230'
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    })
  },
  handleContact(e) {
    console.log(e.path)
    console.log(e.query)
  }
})