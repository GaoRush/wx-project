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
      title: '分类'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    statusBar_height: 0,
    category_list: [],
    scroll_main: '',
    curNavId: 0,
    curIndex: 0,
    // 是否默认显示第一个
    show_first: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {

    let that = this
    if (options.curNavId && options.index) {
      // 有id传来显示该id的数据
      that.setData({
        curNavId: Number(options.curNavId),
        curIndex: Number(options.index),
        show_first: false
      })
      console.log('options', options)
      console.log('that.data', that.data)

    }
    console.log('curNavId', that.data.curNavId)

    // 获取自定义导航的整体高度
    that.setData({
      statusBar_height: that.selectComponent('#statusBar')
    })
    // 缓存全局
    app.globalData.statusBar_height = that.data.statusBar_height

    // 获取分类列表
    that.get_category_list()

    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {

        // 可使用窗口宽度、高度
        // console.log('height=' + res.windowHeight)
        // console.log('width=' + res.windowWidth)
        // console.log('状态栏高度=' + res.statusBarHeight)
        // console.log('搜索栏高度=', '50px')

        // 计算主体部分高度,单位为px
        that.setData({
          // 滚动区域高度 = 利用窗口可使用高度 - 自定义导航头部高度-搜索栏高度
          scroll_main: res.windowHeight - that.data.statusBar_height - 50
        })
      }
    })
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

  // 获取分类列表
  get_category_list: function () {
    let that = this
    login
      .requestP_pro({
          url: `${config.postUrl + 'category_list'}`
        },
        false
      )
      .then(res => {
        console.log('get_category_list_res', res)

        if (res.status == 1) {

          that.setData({
            category_list: res.data,
            // curNavId: res.data[0].id,
          })
          if (that.data.show_first) {
            that.setData({
              category_list: res.data,
              curNavId: res.data[0].id,
              curIndex: 0,
            })
          } else {

          }

          console.log('category_list', that.data.category_list)
          console.log('that.data', that.data)
        }
      })
      .catch(err => {
        common.alert(err)
      })
  },

  // 点击显示右则子类
  switchRightTab: function (e) {
    let that = this
    console.log('e', e)
    let index = e.currentTarget.dataset.index
    let id = e.currentTarget.dataset.id
    that.setData({
      curNavId: id,
      curIndex: index
    })
  },

  // 搜索
  inputSearch: function (e) {
    // 获取用户输入框中的值
    let inputVaue = e.detail.value['search-input'] ? e.detail.value['search-input'] : e.detail.value;
    if (!inputVaue) {
      common.alert('请输入搜索关键词')
      return;
    }
    let searchUrl = "../../pages/goods_list/goods_list?keyword=" + inputVaue;
    // let searchUrl = "/product/index?keyword=" + inputVaue + "&fromindex=true";
    // this.converterUrlAndRedirect(searchUrl);

    // 跳转搜索页面
    wx.navigateTo({
      url: searchUrl
    })
  }
})