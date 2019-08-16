'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
// const slider = require('../../assets/js/slider_delete.js')
const app = getApp()

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '购物车'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    shopCart_list: [],
    // 数量
    num: 999,
    // minusStatus: 'disabled',
    // 金额
    totalPrice: 0, // 总价，初始为0
    // 全选状态
    selectAllStatus: false,
    // // 选中的商品
    // selectedList: []

    // 禁止点击
    slider_disabled: false,

    // 左滑删除

    totalPrice: 0,

    // 自定义导航返回
    back: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this
    console.log('options', options)
    app.globalData.newCart = false
    if (options.back == 'true') {
      that.setData({
        back: true
      })
    }

    // if (options.cid) {
    //   // 有分类id
    //   that.setData({
    //     cid: Number(options.cid),
    //     [`statusBar.title`]: options.title
    //   })
    // }

    // 默认全选购物车
    // that.selectCartAll()
    console.log('获取购物车列表get_cart_list')
    // 获取购物车列表
    that.get_cart_list()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    console.log('页面显示', app.globalData.selected_goods_list)

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {
    console.log('监听页面隐藏')

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {
    console.log('下拉刷新')
    let that = this
    that.setData({
      page_index: 1,
      page_size: 8,
      shopCart_list: [],
      isMore: true,
    })
    that.get_cart_list();
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

  // 获取购物车列表
  get_cart_list: function (e) {
    let that = this

    login
      .requestP_pro({
        url: `${config.postUrl + 'cart_list'}`,
        data: {}
      })
      .then(res => {
        console.log('res', res)
        if (res) {
          that.setData({
            shopCart_list: res.data
          })
          console.log('shopCart_list', that.data.shopCart_list)

          // 重新渲染更新前的选中状态
          if (app.globalData.selected_goods_list.length > 0) {

            console.log('重新渲染更新前的选中状态', app.globalData.selected_goods_list)

            let shopCart_list = that.data.shopCart_list
            let selected_goods_list = app.globalData.selected_goods_list

            // 购物车有没增减商品的情况下,记住全选选中状态
            if (selected_goods_list.length == shopCart_list.length) {
              for (let j = 0; j < selected_goods_list.length; j++) {
                if (selected_goods_list[j] == false) {
                  that.setData({
                    selectAllStatus: false
                  })
                  console.log('selectAllStatus', j, that.data.selectAllStatus)
                  break;
                } else {
                  that.setData({
                    selectAllStatus: true
                  })
                  console.log('selectAllStatus', j, that.data.selectAllStatus)
                }
              }
            }


            for (let i = 0; i < selected_goods_list.length; i++) {
              let selected = selected_goods_list[i];
              console.log('selected', i, selected)
              shopCart_list[i].selected = selected

            }


            console.log('selectAllStatus', that.data.selectAllStatus)

            that.setData({
              shopCart_list: shopCart_list,
            })
            console.log('that.data', that.data)

            // 计算金额方法
            that.count_price()
          } else {
            // 默认全选购物车
            // that.selectCartAll()
          }
        }
      })
      .catch(err => {
        common.showErr(err)
      })
  },

  // 点击减号
  bindMinus: function (e) {
    console.log('bindMinus—e', e)
    let that = this
    let prdindex = e.currentTarget.dataset.prdindex
    let shopCart_list = that.data.shopCart_list
    let quantity = shopCart_list[prdindex].quantity

    // 大于1时才可以减
    if (quantity > 1) {
      quantity--
      shopCart_list[prdindex].quantity = quantity
      that.setData({
        shopCart_list: shopCart_list
      })
      let shopcartid = shopCart_list[prdindex].id
      // 计算金额方法
      that.count_price()
      // // 更新购物车
      that.updateCart(shopcartid, quantity)
    } else {
      wx.showToast({
        title: '不能再少了!',
        icon: 'none'
      })
      return false
    }
  },

  // 点击加号
  bindPlus: function (e) {
    console.log('bindPlus-e', e)
    let that = this
    let prdindex = e.currentTarget.dataset.prdindex
    let shopCart_list = that.data.shopCart_list
    let quantity = shopCart_list[prdindex].quantity

    // 大于1时才可以减
    quantity++
    shopCart_list[prdindex].quantity = quantity
    that.setData({
      shopCart_list: shopCart_list
    })
    let shopcartid = shopCart_list[prdindex].id
    // 计算金额方法
    that.count_price()
    // // 更新购物车
    that.updateCart(shopcartid, quantity)
  },
  bindInput: function (e) {
    console.log('bindInput e', e)
    let that = this
    let prdindex = e.currentTarget.dataset.prdindex
    let shopCart_list = that.data.shopCart_list
    let quantity = e.detail.value

    if (quantity <= 0) {
      wx.showToast({
        title: '不能再少了!',
        icon: 'none'
      })
      return false
    }
    let shopcartid = shopCart_list[prdindex].id
    // 计算金额方法
    that.count_price()
    // // 更新购物车
    that.updateCart(shopcartid, quantity)
  },

  // 选择商品
  selectCart: function (e) {
    let that = this
    let prdindex = e.currentTarget.dataset.prdindex
    let shopCart_list = that.data.shopCart_list


    // 默认全选
    that.data.selectAllStatus = true
    // 循环数组数据，判断----选中/未选中[selected]
    shopCart_list[prdindex].selected = !shopCart_list[prdindex].selected
    // 如果数组数据全部为selected[true],全选

    for (let i = 0; i < shopCart_list.length; i++) {
      if (!shopCart_list[i].selected) {
        that.data.selectAllStatus = false
        break
      }
    }

    // 重新渲染数据
    that.setData({
      shopCart_list: shopCart_list,
      selectAllStatus: that.data.selectAllStatus
    })

    //获取更新前的选中状态， 前提有商品的情况下
    if (shopCart_list.length > 0) {
      // 购物车选中的商品
      let selected_goods_list = []
      for (let i = 0; i < shopCart_list.length; i++) {
        let goods_select = shopCart_list[i].selected == true ? true : false
        selected_goods_list.push(goods_select)
      }
      console.log('selected_goods_list', selected_goods_list)
      app.globalData.selected_goods_list = selected_goods_list
    }

    // 调用计算金额方法
    that.count_price()
  },
  /**
   * 购物车全选
   */
  selectCartAll(e) {
    let that = this
    // 全选ICON默认选中
    let selectAllStatus = that.data.selectAllStatus
    // true  -----   false
    selectAllStatus = !selectAllStatus
    // 获取商品数据
    let shopCart_list = that.data.shopCart_list
    // 循环遍历判断列表中的数据是否选中
    for (let i = 0; i < shopCart_list.length; i++) {
      shopCart_list[i].selected = selectAllStatus
    }
    // 页面重新渲染
    that.setData({
      selectAllStatus: selectAllStatus,
      shopCart_list: shopCart_list
    })
    //获取更新前的选中状态， 前提有商品的情况下
    if (shopCart_list.length > 0) {
      // 购物车选中的商品
      let selected_goods_list = []
      for (let i = 0; i < shopCart_list.length; i++) {
        let goods_select = shopCart_list[i].selected == true ? true : false
        selected_goods_list.push(goods_select)
      }
      console.log('selected_goods_list', selected_goods_list)
      app.globalData.selected_goods_list = selected_goods_list
    }
    // 计算金额方法
    that.count_price()
  },
  // 计算金额方法
  count_price: function () {
    let that = this
    // 获取商品列表数据
    let shopCart_list = that.data.shopCart_list
    // 声明一个变量接收数组列表price
    let total = 0
    // 循环列表得到每个数据
    for (let i = 0; i < shopCart_list.length; i++) {
      // 判断选中计算价格
      if (shopCart_list[i].selected) {
        // 所有价格加起来 count_money
        total += shopCart_list[i].quantity * shopCart_list[i].sell_price
      }
    }
    // 最后赋值到data中渲染到页面
    that.setData({
      shopCart_list: shopCart_list,
      totalPrice: total.toFixed(2)
    })
  },

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
    let shopCart_list = this.data.shopCart_list

    // 收起其他的商品的删除按钮
    for (let index = 0; index < shopCart_list.length; index++) {
      shopCart_list[index].xmove = 0
      if (prdindex == index) {
        shopCart_list[prdindex].xmove = xmove
      }
    }

    this.setData({
      shopCart_list: shopCart_list
    })
  },

  /**
   * 处理movable-view移动事件
   */
  handleMovableChange: function (e) {
    // console.log('e', e.detail)
    // if (e.detail.source === 'friction') {
    //   if (e.detail.x < -30) {
    //     // this.showDeleteButton(e)
    //   } else {
    //     this.hideDeleteButton(e)
    //   }
    // } else if (e.detail.source === 'out-of-bounds' && e.detail.x === 0) {
    //   console.log('1')
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
    let shopcartid = e.currentTarget.dataset.id
    let prdindex = e.currentTarget.dataset.prdindex
    let shopCart_list = that.data.shopCart_list
    let quantity = shopCart_list[prdindex].quantity

    // let prdindex = shopCart_list.findIndex(item => item.id = shopcartid)
    console.log('prdindex', prdindex)

    wx.showModal({
      title: '提示',
      content: '确定删除吗？',
      success(res) {
        if (res.confirm) {
          console.log('确定')
          shopCart_list.splice(prdindex, 1)
          // 缓存的购物车列表记录状态同样删除
          app.globalData.selected_goods_list.splice(prdindex, 1)
          that.setData({
            shopCart_list: shopCart_list
          })

          // 删除购物车
          that.deleteCart(shopcartid, quantity)
        } else if (res.cancel) {
          console.log('取消')
          return false
        }
      }
    })

  },

  // 删除购物车
  deleteCart: function (shopcartid, quantity) {
    let that = this
    login
      .requestP_pro({
        url: `${config.postUrl + 'cart_remove'}`,
        data: {
          id: shopcartid
        }
      })
      .then(res => {
        console.log('res', res)
        common.alert(res.msg, 'success')
        console.log('shopcartid', shopcartid, 'quantity', quantity)
        // 计算金额方法
        that.count_price()
      })
      .catch(err => {
        common.showErr(err)
      })
  },
  // 更新购物车
  updateCart: function (shopcartid, quantity) {
    console.log('shopcartid', shopcartid)
    console.log('quantity', quantity)
    let that = this
    console.log('执行更新购物车')
    login
      .requestP_pro({
        url: `${config.postUrl + 'cart_update'}`,
        data: {
          id: shopcartid,
          quantity: quantity
        }
      })
      .then(res => {
        console.log('res', res)
        // 重新获取购物车列表
        that.get_cart_list()
        // common.alert(res.msg, 'success')
      })
      .catch(err => {
        common.showErr(err)
      })
  },


  // 购物车结算
  cart_submit: function () {
    let that = this
    let shopCart_list = that.data.shopCart_list
    let arr_cartId = [];

    for (let i = 0; i < shopCart_list.length; i++) {
      const element = shopCart_list[i];
      if (shopCart_list[i].selected) {
        arr_cartId.push(shopCart_list[i].id)
      }
      console.log('arr_cartId', arr_cartId)
    }
    console.log('arr_cartId最后', arr_cartId)
    let id_list = arr_cartId.join(",");
    console.log('id_list', id_list)

    login.requestP_pro({
      url: `${config.postUrl+'cart_submit'}`,
      data: {
        id_list: id_list
      }
    }).then((res) => {
      console.log('res', res)
      // 跳转到订单确认页面
      wx.navigateTo({
        url: `${'../../pages/order_submit/order_submit?id_list=' + id_list}`,
      })
    }).catch((err) => {
      common.showErr(err)
    });
  },
  // 收货地址列表
  get_address_list: function () {
    let that = this
    login.requestP_pro({
      url: `${config.postUrl + "address_list"}`,
      data: {}
    }).then((res) => {
      console.log('res', res)

      let address_list = res.list

      if (!address_list.length > 0) {
        let url = `${"../../pages/address_list/address_list?chose_address=1"}`
        common.alert_url('请先填写收货地址', 'none', true, url)
      } else {
        // 购物车结算
        that.cart_submit()
      }
    }).catch((err) => {
      common.showErr(err)
    });
  },
  // 购物车结算预提交
  cart_submit_pre: function () {
    let that = this
    that.get_address_list()
  },
})