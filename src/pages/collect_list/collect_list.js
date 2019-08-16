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
      title: '我的收藏'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    // tab选项卡
    currentTab: 0,
    page_index: 1,
    page_size: 8,
    type: 1,
    collect_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    // let that = this
    // console.log('options', options)

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
    // 刷新收藏列表
    that.setData({
      page_index: 1,
      page_size: 8,
      collect_list: [],
      isMore: true,
    })
    // 获取我的收藏列表
    that.get_collect_list()
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
      collect_list: [],
      isMore: true,
    })
    that.get_collect_list();
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
  /***************************左滑删除***************************/

  /**
   * 显示删除按钮
   */
  showDeleteButton: function (e) {
    let prdindex = e.currentTarget.dataset.prdindex
    this.setXmove(prdindex, -65)
    this.setData({
      slider_disabled: true
    })
  },

  /**
   * 隐藏删除按钮
   */
  hideDeleteButton: function (e) {
    let prdindex = e.currentTarget.dataset.prdindex
    this.setXmove(prdindex, 0)
    this.setData({
      slider_disabled: false
    })
  },

  /**
   * 设置movable-view位移
   */
  setXmove: function (prdindex, xmove) {
    let collect_list = this.data.collect_list

    // 收起其他的商品的删除按钮
    for (let index = 0; index < collect_list.length; index++) {
      collect_list[index].xmove = 0
      if (prdindex == index) {
        collect_list[prdindex].xmove = xmove
      }
    }

    this.setData({
      collect_list: collect_list
    })
  },

  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function (e) {
    // console.log('e', e)
    // if (e.detail.source === 'friction') {
    //   if (e.detail.x < -30) {
    //     this.showDeleteButton(e)
    //   } else {
    //     this.hideDeleteButton(e)
    //   }
    // } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
    //   this.hideDeleteButton(e)
    // }
  },

  /**
   * 处理touchstart事件
   */
  handleTouchStart(e) {
    // console.log('e star', e)
    this.startX = e.touches[0].pageX
  },

  /**
   * 处理touchend事件
   */
  handleTouchEnd(e) {
    // console.log('e', e)
    if (
      e.changedTouches[0].pageX < this.startX &&
      e.changedTouches[0].pageX - this.startX <= -30
    ) {
      // 左滑
      this.showDeleteButton(e)
    } else if (
      e.changedTouches[0].pageX > this.startX &&
      e.changedTouches[0].pageX - this.startX < 30
    ) {
      // 右滑
      this.showDeleteButton(e)
    } else {
      this.hideDeleteButton(e)
    }
  },

  /**
   * 左滑删除按钮
   */
  handleSlideDelete: function (e) {
    let that = this
    let collectid = e.currentTarget.dataset.id
    let prdindex = e.currentTarget.dataset.prdindex
    let collect_list = that.data.collect_list
    // let quantity = collect_list[prdindex].quantity

    // let prdindex = collect_list.findIndex(item => item.id = collectid)
    console.log('e', e)

    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success(res) {
        if (res.confirm) {
          console.log('确定')
          collect_list.splice(prdindex, 1)
          that.setData({
            collect_list: collect_list
          })

          console.log('collectid', collectid)

          // 收藏
          that.bindCol(collectid)
        } else if (res.cancel) {
          console.log('取消')
          return false
        }
      }
    })

  },

  // 收藏
  bindCol: function (collectid) {
    let that = this
    // // 商品详情
    // let goods_detail = that.data.goods_detail
    // 是否收藏
    // let is_collect = goods_detail.is_collect
    // 收藏的商品id
    let goodsId = collectid
    console.log('goodsId', goodsId)
    login.requestP_pro({
      url: `${config.postUrl + 'collect_add'}`,
      data: {
        id: goodsId
      }
    }).then((res) => {
      console.log('收藏', res)
      common.alert(res.msg)
      // 获取我的收藏列表
      that.get_collect_list()
    }).catch((err) => {
      common.showErr(err)
    });
  },

  // 获取我的收藏列表
  get_collect_list: function () {
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
      url: `${config.postUrl+'collect_list'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      // 停止加载
      common.stop_loading(500)

      // 加载更多:2 拼接新数据
      let old_list = that.data.collect_list
      let res_list = res.list
      let new_list = old_list.concat(res_list)

      // 加载更多:3 赋值
      that.setData({
        collect_list: new_list,
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
        that.get_collect_list()
      }
    }

  }
})