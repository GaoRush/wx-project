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
      title: '优惠券'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    // tab选项卡
    currentTab: 0,
    page_index: 1,
    page_size: 8,
    type: 1,
    coupon_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this
    console.log('options', options)
    // 转赠流程:1
    wx.showShareMenu({
      withShareTicket: true,
      success: function (res) {
        // 分享成功
        // console.log('shareMenu share success')
        // console.log('分享', res)
        // common.alert('分享成功！')
        // common.alert(res)
        // 来自转赠
        if (options.coupon_token && options.user_token && options.user_token != '' && options.coupon_token != '') {
          console.log('来自转赠 get_coupon()', options.user_token, options.coupon_token)
          that.setData({
            coupon_token: options.coupon_token,
            user_token: options.user_token,
          })
          // 获取转赠的优惠券
          that.get_coupon()
        } else {
          console.log('获取优惠券 get_coupon_list()')
          // 获取优惠券
          that.get_coupon_list()
        }
      },
      fail: function (res) {
        // 分享失败
        console.log(res)
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
  onShow: function onShow() {
    // let that = this
    // // 刷新优惠券
    // that.setData({
    //   page_index: 1,
    //   page_size: 8,
    //   coupon_list: [],
    //   isMore: true,
    // })
    // that.get_coupon_list();

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
      coupon_list: [],
      isMore: true,
    })
    that.get_coupon_list();
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

  //tab选项卡:用户点击tab时调用
  clickTab: function (e) {
    var that = this;
    if (this.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current,
        page_index: 1,
        page_size: 8,
        status: '',
        coupon_list: []
      })
    }
    // 获取优惠券
    that.get_coupon_list()
  },
  // 获取优惠券列表
  get_coupon_list: function () {
    // 加载
    common.show_loading()

    let that = this
    let currentTab = that.data.currentTab

    let urlData = {
      page_index: that.data.page_index,
      page_size: that.data.page_size,
      type: that.data.type,
    }

    if (currentTab == 0) {
      // use
      urlData.type = 1
    } else if (currentTab == 1) {
      // used
      urlData.type = 2
    } else if (currentTab == 2) {
      // overdue
      urlData.type = 3
    }

    console.log('urlData', urlData)
    // 优惠券列表
    login.requestP_pro({
      url: `${config.postUrl+'coupon_list'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      // 停止加载
      common.stop_loading(500)

      // 加载更多:2 拼接新数据
      let old_list = that.data.coupon_list
      let res_list = res.list
      // 时间格式处理
      if (res_list) {
        let list = res_list
        if (list.length > 0) {
          for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let start_time = common.date_time('date', item.start_time)
            let end_time = common.date_time('date', item.end_time)
            list[i].start_time = start_time
            list[i].end_time = end_time
          }
        }
      }
      let new_list = old_list.concat(res_list)
      // 加载更多:3 赋值
      that.setData({
        coupon_list: new_list,
        page_index: res.page_index,
        page_size: res.page_size,
        total_count: res.total_count,
        isMore: true
      })

    }).catch((err) => {
      common.showErr(err)
    });
  },
  /**
   * 用户点击右上角分享
   */
  // 转赠流程： 2 
  /* 转发*/
  onShareAppMessage: function (options) {
    let that = this
    console.log('options', options)
    let coupon_token = options.target.dataset.coupon_token
    let user_token = options.target.dataset.user_token


    if (options.from === "button") {
      // 来自页面内转发按钮
      console.log(options.target)
      // common.showErr('转发成功')

    }
    return {
      title: '我赠送的优惠券',
      imageUrl: "../../assets/images/coupon.png",
      path: `${'pages/coupon_list/coupon_list?user_token='+user_token+'&coupon_token='+coupon_token}`,
      success: function (res) {
        console.log('res', res)
        // 转发成功
        console.log("转发成功1:" + JSON.stringify(res));
        common.showErr('转发成功1')
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        //可以获取群组信息
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function (res) {
            console.log('可以获取群组信息', res)
          }
        })

      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        common.showErr('转发失败')

      }
    }
  },

  // 获取转赠的优惠券
  get_coupon: function () {
    let that = this
    let user_token = that.data.user_token
    let coupon_token = that.data.coupon_token

    let urlData = {
      source_coupon_token: coupon_token,
      source_user_token: user_token,
    }
    console.log("urlData", urlData)
    // 优惠券列表
    login.requestP_pro({
      url: `${config.postUrl+'get_coupon'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)

      // 加载优惠券列表
      that.get_coupon_list()

    }).catch((err) => {
      common.showErr(err)
      // 加载优惠券列表
      that.get_coupon_list()

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
        that.get_coupon_list()
      }
    }

  }
})