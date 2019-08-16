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
      title: '提交订单'
    },
    url: config.url,
    imgUrl: config.imgUrl,


    // 购物车里的商品
    id_list: "",
    // 地址
    address: "",
    // 优惠券列表
    coupon_list: [],
    // 商品列表
    goods_list: [],
    // 订单金额
    order_money: "",
    // 钱包余额
    user_money: "",
    // 支付方式
    payment_type_items: [{
        name: '线上支付',
        value: 1,
        checked: true,
      },
      {
        name: '线下支付',
        value: 2,
        checked: false,
      },
    ],

    // 收货地址（必须）
    address_id: "",
    // 支付方式（必须，1线上，2线下）
    payment_type: 1,
    // 优惠券编号（ 非必须）
    coupon_no: '',
    //  是否使用钱包（ 非必须）
    is_wallet: 1,
    // 可用金额（ 非必须）
    use_money: 0,

    // 显示优惠券选择窗
    isShow_coupon: false,
    // 选中的优惠券张数
    checked_num_coupon: 0,
    // 选中的优惠券金额
    checked_money_coupon: 0,
    // 输入的金额
    // use_money: 0,
    // 计算后的剩余可用金额
    sum_money: 0,
    // 总金额
    totalPrice: 0,

    // 订单支付状态提示弹窗 0支付失败1支付成2线下
    pay_status: '',
    // 支付弹窗
    order_pay_pop: false,
    order_amount: 0,

    // 自定义返回路径
    navToUrl: "",
    fromOrder: false
  },

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    console.log('options', options)
    let that = this
    let order_no = options.order_no

    // 来自团购
    if (options.order_no && options.isGroupBuying == 'true') {
      console.log("从团购列单进入")

      that.setData({
        order_no: order_no,
        isGroupBuying: true,
        navToUrl: ""
      })
    } else if (options.order_no && options.isGroupBuying == 'false') {
      console.log("从普通列单进入")
      that.setData({
        order_no: order_no,
        isGroupBuying: false,
        navToUrl: ""
      })
    } else if (options.order_no) {
      // 从订单列表进入
      // 订单编号
      console.log("从订单列表进入")
      that.setData({
        order_no: order_no,
        navToUrl: ""
      })
    }

    if (options.fromOrder == 'true') {
      console.log("从下单页面进入")
      that.setData({
        navToUrl: "../../pages/shopCart_list/shopCart_list",
        fromOrder: true
      })
    }

    // 订单详情
    that.user_order_details()
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

  // 订单详情
  user_order_details: function () {
    let that = this
    let api = 'user_order_details'
    if (that.data.isGroupBuying) {
      api = 'user_group_buying_order_details'
    }

    let order_no = that.data.order_no
    let urlData = {
      order_no: order_no
    }

    // 发起请求
    login.requestP_pro({
      url: `${config.postUrl+api}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      that.setData({
        order_details: res.data,
      })

      // 普通订单详情
      let order_details = {
        accept_name: res.data.accept_name,
        add_time: res.data.add_time,
        address: res.data.address,
        complete_time: res.data.complete_time,
        coupon_amount: Number(res.data.coupon_amount).toFixed(2),
        express_name: res.data.express_name,
        express_no: res.data.express_no,
        express_status: res.data.express_status,
        express_time: res.data.express_time,
        mobile: res.data.mobile,
        order_amount: Number(res.data.order_amount).toFixed(2),
        order_goods: res.data.order_goods,
        order_no: res.data.order_no,
        payment_name: res.data.payment_name,
        payment_status: res.data.payment_status,
        payment_time: res.data.payment_time,
        status: res.data.status,
        status_str: res.data.status_str,
        use_amount: Number(res.data.use_amount).toFixed(2),
        payable_amount: Number(res.data.payable_amount).toFixed(2),
      }

      // 团购订单详情
      if (that.data.isGroupBuying) {
        order_details.group_buying_price = res.data.group_buying_price
        order_details.final_amount = res.data.final_amount
        order_details.refund_amount = res.data.refund_amount
        order_details.refund_status = res.data.refund_status
      }


      // 时间格式处理
      if (order_details) {
        order_details.add_time = common.date_time('time', order_details.add_time)
        order_details.complete_time = common.date_time('time', order_details.complete_time)
        order_details.express_time = common.date_time('time', order_details.express_time)
        order_details.payment_time = common.date_time('time', order_details.payment_time)
      }
      // 手机号码加密处理
      if (order_details.mobile) {
        let mobile = order_details.mobile
        order_details.mobile = common.hide_mobile(mobile)
      }

      that.setData({
        order_details: order_details,
        // 修改标题
        [`statusBar.title`]: order_details.status_str
      })
      console.log('order_details', order_details)

    }).catch((err) => {
      common.showErr(err)
    });

  },

  // 修改订单状态
  edit_order_status: function (e) {
    console.log(e)
    let that = this
    let index = e.currentTarget.dataset.idx
    // 订单编号
    let order_no = that.data.order_details.order_no
    let edit_type = e.currentTarget.dataset.edit_type
    let urlData = {
      order_no: order_no,
      edit_type: edit_type,
    }
    console.log('urlData', urlData)

    let show_msg = ''
    if (urlData.edit_type == 'order_cancel') {
      show_msg = '确定取消订单吗'
    } else if (urlData.edit_type == 'order_complete') {
      show_msg = '是否确认收货'
    }
    wx.showModal({
      title: '提示',
      content: show_msg,
      success(res) {
        if (res.confirm) {
          // 修改订单状态
          login.requestP_pro({
            url: `${config.postUrl+'edit_order_status'}`,
            data: urlData
          }).then((res) => {
            console.log('res', res)
            if (that.data.fromOrder) {
              let url = '../../pages/mine/mine'
              // 返回列表
              common.alert_url(res.msg, 'none', true, url)

            } else {
              // 返回列表
              common.alert_back(res.msg)
            }


          }).catch((err) => {
            common.showErr(err)
          });
        } else if (res.cancel) {
          return false
        }
      }
    })

  },

  // 点击复制文本
  bind_copy: function () {
    let that = this
    let express_no = that.data.order_details.express_no
    wx.setClipboardData({
      data: express_no,
      success(res) {
        wx.getClipboardData({
          success(res) {
            console.log(res.data) // data
          }
        })
      }
    })
  },

  //支付流程：3.提交订单（普通订单）,先调用 预提交订单（普通订单） 接口
  // order_submit: function () {
  //   let that = this
  //   let address_id = that.data.address.id
  //   let payment_type = that.data.payment_type
  //   let coupon_no = that.data.coupon_no.replace(',', '')
  //   let is_wallet = that.data.is_wallet
  //   let use_money = Number(that.data.use_money)

  //   let urlData = {
  //     address_id: address_id,
  //     payment_type: payment_type,
  //     coupon_no: coupon_no,
  //     is_wallet: is_wallet,
  //     use_money: use_money,
  //   }
  //   console.log('urlData', urlData)

  //   // 提交订单
  //   login.requestP_pro({
  //     url: `${config.postUrl+'order_submit'}`,
  //     data: urlData
  //   }).then((res) => {
  //     console.log('res', res)
  //     if (res.data.order_no) {

  //       // 订单提交成功后，购物车的选中状态清空
  //       app.globalData.selected_goods_list = []

  //       // 订单编号，订单总额
  //       that.setData({
  //         order_no: res.data.order_no,
  //         order_amount: res.data.order_amount,
  //       })

  //       if (that.data.payment_type == 1) {
  //         let order_amount = that.data.order_amount
  //         console.log('线上支付,订单金额order_amount：' + order_amount)
  //         // 订单金额大于0元才能发起微信支付
  //         common.alert(res.msg)
  //         // 支付弹窗
  //         that.order_pay_pop()

  //       } else if (that.data.payment_type == 2) {
  //         // 提交成功,提示线下支付
  //         that.setData({
  //           pay_status: 3
  //         })
  //       }

  //     }


  //   }).catch((err) => {
  //     common.showErr(err)
  //   });
  // },

  order_submit_detail: function () {
    let that = this
    // 订单编号，订单总额
    console.log(that.data)

    console.log(that.data.order_details.order_no, that.data.order_details.order_amount)
    that.setData({
      order_no: that.data.order_details.order_no,
      order_amount: that.data.order_details.order_amount,
    })

    that.order_pay_pop()
  },



  //支付流程：4 支付弹窗
  order_pay_pop: function () {
    console.log('支付弹窗order_pay_pop')

    let that = this
    let order_pay_pop = that.data.order_pay_pop
    order_pay_pop = !order_pay_pop
    that.setData({
      order_pay_pop: order_pay_pop
    })
  },
  //支付流程：5.订单支付
  order_payment: function () {
    let that = this
    let order_no = that.data.order_no
    let urlData = {
      order_no: order_no
    }
    // 发起支付
    login.requestP_pro({
      url: `${config.postUrl+'order_payment'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      // 创建微信支付成功
      that.setData({
        appid: res.data.appid,
        nonce_str: res.data.nonce_str,
        package: res.data.package,
        pay_sign: res.data.pay_sign,
        time_stamp: res.data.time_stamp,
      })

      // 微信支付接口
      wx.requestPayment({
        timeStamp: that.data.time_stamp,
        nonceStr: that.data.nonce_str,
        package: that.data.package,
        signType: 'MD5',
        paySign: that.data.pay_sign,
        success(res) {
          console.log('res', res)
          // let url = '../../pages/user_order_list/user_order_list'
          // common.alert_url(res.msg, url)
          // common.alert('支付成功!')
          that.setData({
            pay_status: 1
          })
          that.order_pay_pop()

        },
        fail(err) {
          // common.alert(err)
          // console.log('err', err)
          // // common.alert('支付失败!')
          // that.setData({
          //   pay_status: 2
          // })
          // that.order_pay_pop()
          // 取消支付
          console.log('取消支付');
          // that.order_pay_pop()

        },
        complete(res) {
          // let url = '../../pages/mine/mine'
          // common.alert_url(res.msg, url)
          // that.order_pay_pop()
        }
      })
    }).catch((err) => {
      common.showErr(err)
    });
  },

  hide_pay_tips: function () {
    let that = this
    that.setData({
      pay_status: ""
    })
  }
})