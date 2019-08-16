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
    is_wallet: 0,
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
    no_address: true,
    // 来自团购的下单
    isGroupBuying: false,
    // 钱包选择按钮
    btn_wallet_disabled: false
  },

  /** 
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    console.log('提交订单options', options)
    let that = this

    // 传入购物车id_list
    if (options.id_list) {
      console.log('购物车传入idlist,购物车结算', options.id_list)
      // 缓存购物车id_list
      wx.setStorageSync('id_list', options.id_list)
      wx.setStorageSync('isGroupBuying', false)
      let id_list = options.id_list
      // 是否来自团购
      that.setData({
        isGroupBuying: false
      })
      // // 购物车结算
      // that.cart_submit(id_list)
      // 预提交订单（ 普通订单）
      that.order_pre_submit()
    } else if (options.gb_urlData) {
      // 传入团购gb_urlData
      console.log('团购传入传入团购gb_urlData,团购结算', options.gb_urlData)

      let gb_urlData = JSON.parse(options.gb_urlData)
      console.log('gb_urlData', gb_urlData)

      // 缓存团购id
      wx.setStorageSync('gb_urlData', gb_urlData)
      wx.setStorageSync('isGroupBuying', true)

      // 是否来自团购
      that.setData({
        isGroupBuying: true
      })
      // 团购结算
      that.gb_buy_now(gb_urlData)

    } else if (options.buy_now == 1) {
      console.log('buy_now,普通订单 立即购买结算', options)
      // 缓存buy_now
      wx.setStorageSync('buy_now', options.buy_now)
      wx.setStorageSync('isGroupBuying', false)

      // 是否来自团购
      that.setData({
        isGroupBuying: false,
        buy_now: 1
      })

      // console.log('立即购买结算', buy_now)
      // 预提交订单（ 普通订单）
      that.order_pre_submit()
    }



    // 判断是否需要授权登录
    login.user_center()

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    console.log('onShow');
    let that = this
    let address_selected = wx.getStorageSync('address_selected')

    // 选择好的收货地址id
    if (address_selected) {
      console.log('收货地址address_selected', address_selected)

      that.setData({
        address_selected: address_selected,
      })

      console.log('address_selected', address_selected)
      // // 缓存选中的收货地址
      // wx.setStorageSync('address_selected', address_selected)
      // console.log('app.globalData.id_list', app.globalData.id_list)

      let isGroupBuying = wx.getStorageSync('isGroupBuying')

      if (isGroupBuying == true) {
        let gb_urlData = wx.getStorageSync('gb_urlData')
        // 团购结算
        that.gb_buy_now(gb_urlData)
        console.log('团购结算', gb_urlData)
      } else {
        let buy_now = wx.getStorageSync('buy_now')

        if (buy_now == 1) {
          console.log('立即购买结算', buy_now)
          // 预提交订单（ 普通订单）
          that.order_pre_submit()
        } else {
          let id_list = wx.getStorageSync('id_list')
          // 购物车结算
          that.cart_submit(id_list)
          console.log('购物车结算', id_list)
        }

      }
      that.setData({
        isGroupBuying: isGroupBuying
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {
    // 页面关闭后清空下单流程缓存

    // wx.setStorageSync('gb_urlData', '')
    // wx.setStorageSync('id_list', '')
    // wx.setStorageSync('isGroupBuying', '')
    // wx.setStorageSync('buy_now', '')
  },

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
  // 1.支付方式
  payment_type_radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    let that = this

    console.log('payment_type', that.data.payment_type)
    let payment_type = e.detail.value
    if (payment_type == 2) {
      wx.showModal({
        title: '支付提示',
        content: '是否线下支付',
        success(res) {
          if (res.confirm) {
            // 确认线下支付
            payment_type = 2
            that.setData({
              payment_type: payment_type,
            })
          } else if (res.cancel) {
            // 取消，线上支付
            payment_type = 1
            that.setData({
              payment_type: payment_type,
              [`payment_type_items[0].checked`]: true,
              [`payment_type_items[1].checked`]: false
            })
            // return false
          }
        }
      })
    } else if (payment_type == 1) {
      that.setData({
        payment_type: payment_type
      })
    }

  },
  //2.选择优惠券
  bindCheckCoupon: function (e) {
    // console.log('bindCheckCoupon', e.currentTarget.dataset.index)
    let that = this
    let index = e.currentTarget.dataset.index
    let coupon_list = that.data.coupon_list


    // 优惠券编号
    let coupon_no = that.data.coupon_no
    // 选中的优惠券张数
    let checked_num_coupon = that.data.checked_num_coupon
    // 选中的优惠券总金额
    let checked_money_coupon = Number(that.data.checked_money_coupon)


    // 多张优惠券选择
    // if (coupon_list[index].checked) {
    //   // 重复点击取消选择
    //   coupon_list[index].checked = false
    //   // 保存已选优惠券编号
    //   coupon_no = coupon_no.replace(',' + coupon_list[index].coupon_no, '')
    //   if (checked_num_coupon > 0) {
    //     // 已选优惠券数量
    //     checked_num_coupon--
    //     // 已选优惠券的金额
    //     checked_money_coupon = checked_money_coupon - coupon_list[index].money

    //   } else {
    //     // 已选优惠券数量
    //     checked_num_coupon = 0
    //     // 已选优惠券的金额
    //     checked_money_coupon = 0
    //   }
    // } else {
    //   // 已选优惠券
    //   coupon_list[index].checked = true
    //   // 保存已选优惠券编号
    //   coupon_no = coupon_no + ',' + coupon_list[index].coupon_no
    //   // 已选优惠券数量
    //   checked_num_coupon++
    //   // 已选优惠券的金额
    //   checked_money_coupon = checked_money_coupon + coupon_list[index].money
    // }

    // 只能单张
    for (let i = 0; i < coupon_list.length; i++) {
      if (i != index) {
        coupon_list[i].checked = false;
      }
    }
    if (coupon_list[index].checked) {
      // 重复点击取消选择
      coupon_list[index].checked = false
      // 保存已选优惠券编号
      coupon_no = ''
      // 已选优惠券数量
      checked_num_coupon = 0
      // 已选优惠券的金额
      checked_money_coupon = 0
    } else {

      let totalPrice = that.data.totalPrice
      if (coupon_list[index].money > totalPrice) {
        common.showErr('优惠券价格不能大于订单金额！')
        return false
      } else {
        // 已选优惠券的金额
        checked_money_coupon = coupon_list[index].money
        // 已选优惠券
        coupon_list[index].checked = true
        // 保存已选优惠券编号
        coupon_no = coupon_list[index].coupon_no
        // 已选优惠券数量
        checked_num_coupon = 1
      }
    }

    that.setData({
      coupon_list: coupon_list,
      coupon_no: coupon_no,
      checked_num_coupon: checked_num_coupon,
      checked_money_coupon: Number(checked_money_coupon).toFixed(2)
    })
    console.log('选择优惠券checked_num_coupon', that.data.checked_num_coupon)

    console.log('选择优惠券编号coupon_no', that.data.coupon_no)

    // 计算总额
    that.sum_totalPrice()
  },
  //2.1选择优惠券关闭按钮
  btn_coupon_pop: function () {
    let that = this
    console.log("isShow_coupon", that.data.isShow_coupon)
    that.setData({
      isShow_coupon: !that.data.isShow_coupon
    })
    console.log("isShow_coupon", that.data.isShow_coupon)

  },
  //3.是否使用钱包
  is_wallet(e) {
    let that = this
    console.log('is_wallet', e.detail.value)
    console.log('that', that.data)
    let is_wallet = e.detail.value ? 1 : 0
    let order_money = that.data.order_money
    let user_money = that.data.user_money

    that.setData({
      is_wallet: is_wallet,
    })
    if (is_wallet == 0) {
      console.log('is_wallet关闭 了', is_wallet)
      that.setData({
        use_money: 0,
        sum_money: user_money,
      })
    }
    console.log('is_wallet', that.data.is_wallet)


    // 来自团购的订单
    if (that.data.isGroupBuying == true) {
      // 使用钱包的话,用最大可用金额
      if (is_wallet == 1) {
        // 钱包金额>=订单金额
        if (Number(user_money) >= Number(order_money)) {
          that.setData({
            use_money: Number(order_money).toFixed(2),
            sum_money: (Number(user_money) - Number(order_money)).toFixed(2),

          })
        } else {
          // 钱包金额 < 订单金额
          that.setData({
            use_money: Number(user_money).toFixed(2),
            sum_money: 0,
          })
        }


      } else {
        that.setData({
          use_money: 0,
          sum_money: user_money,
        })
      }
    }

    // 计算总额
    that.sum_totalPrice()
  },
  //3.1输入金额
  bindInput_money: function (e) {
    console.log('e', e)

    let that = this
    let name = e.currentTarget.dataset.name
    let user_money = that.data.user_money
    let sum_money = 0


    if (name == 'use_money') {
      console.log('输入金额', name)
      // 只要输入了都会使用钱包
      that.setData({
        is_wallet: 1,
      })
      let use_money = Number(e.detail.value).toFixed(2);
      // 正则检测是否正确金额，否取最大值金额
      if (!common.isMoney(use_money)) {
        wx.hideToast()
        common.showErr('请输入正确的金额！')
        use_money = 0
      }

      // 算出剩下的可用金额,保留两位小数
      sum_money = (that.data.user_money - use_money).toFixed(2);

      // 检测是否超过可用金额范围！超过则取最大值金额
      if (sum_money < 0) {
        common.showErr('超过可用金额范围！')
        that.setData({
          use_money: user_money,
          sum_money: Number(0).toFixed(2),
        })
        // 计算总额
        that.sum_totalPrice()
        return false;
      } else {
        that.setData({
          use_money: use_money,
          sum_money: sum_money,
        })
      }
      console.log('user_money', that.data)
    }
    // 计算总额
    that.sum_totalPrice()
  },
  //4.计算总额
  sum_totalPrice: function () {
    let that = this
    // 商品总额
    let order_money = that.data.order_money
    // 优惠券总额
    let checked_money_coupon = that.data.checked_money_coupon
    // 钱包使用总额
    let use_money = Number(that.data.use_money)

    let totalPrice = order_money - checked_money_coupon - use_money
    totalPrice < 0 ? totalPrice = 0 : totalPrice = Number(totalPrice).toFixed(2)
    that.setData({
      totalPrice: totalPrice
    })
    console.log('最终价格', that.data.totalPrice)
  },
  //支付流程：1.购物车结算
  cart_submit: function (id_list) {

    let that = this
    // 传入购物车id_list
    console.log('传入购物车id_list', id_list)
    login.requestP_pro({
      url: `${config.postUrl+'cart_submit'}`,
      data: {
        id_list: id_list
      }
    }).then((res) => {
      console.log('res', res)

      // 预提交订单（ 普通订单）
      that.order_pre_submit()
    }).catch((err) => {
      common.showErr(err)
    });
  },
  //支付流程：2.预提交订单（ 普通订单）,先调用 购物车结算 接口
  order_pre_submit: function () {
    let that = this
    login.requestP_pro({
      url: `${config.postUrl+'order_pre_submit'}`,
      data: {}
    }).then((res) => {
      console.log('res', res)
      if (res.data) {
        that.setData({
          address: res.data.address,
          coupon_list: res.data.coupon_list,
          goods_list: res.data.goods_list,
          order_money: res.data.order_money,
          user_money: res.data.user_money,
          sum_money: res.data.user_money,
          address_id: res.data.address.id,
          totalPrice: res.data.order_money,
          no_address: false
        })
      }
      // let address_selected = getStorageSync('address_selected');
      if (that.data.address_selected) {
        // 选中的收货地址数据
        if (Object.keys(that.data.address_selected).length != 0) {
          console.log('收货地址（必须）address_id:', that.data.address)
          console.log('收货地址（必须）address_id:', that.data.address_selected)
          that.setData({
            address: that.data.address_selected,
            address_id: that.data.address_selected.id,
            no_address: false

          })

          console.log('收货地址（必须）address_id改变的:' + that.data.address_id)
          console.log('收货地址（必须）address_id改变的:', that.data.address)

        }
      }
      console.log('收货地址（必须）address_id:' + that.data.address_id)


      // 手机号码加密处理
      if (that.data.address.mobile) {
        let mobile = that.data.address.mobile
        mobile = common.hide_mobile(mobile)
        that.setData({
          [`address.mobile`]: mobile
        })
      }

      // 优惠券时间格式处理
      if (that.data.coupon_list) {
        let coupon_list = that.data.coupon_list
        if (coupon_list.length > 0) {
          for (let i = 0; i < coupon_list.length; i++) {
            let coupon_item = coupon_list[i];
            let start_time = common.GetDateFormat(coupon_item.start_time)
            let end_time = common.GetDateFormat(coupon_item.end_time)
            coupon_list[i].start_time = start_time.replace(/\//g, '.');
            coupon_list[i].end_time = end_time.replace(/\//g, '.');
          }
          that.setData({
            coupon_list: coupon_list
          })
          console.log('coupon_list', coupon_list)
        }
      }

    }).catch((err) => {
      common.showErr(err)
    });
  },
  //支付流程：3.提交订单（普通订单）,先调用 预提交订单（普通订单） 接口
  order_submit: function () {
    let that = this
    let address_id = that.data.address_id
    let payment_type = that.data.payment_type
    let coupon_no = that.data.coupon_no.replace(',', '')
    let is_wallet = that.data.is_wallet
    let use_money = Number(that.data.use_money)

    let urlData = {
      address_id: address_id,
      payment_type: payment_type,
      coupon_no: coupon_no,
      is_wallet: is_wallet,
      use_money: use_money,
    }
    console.log('urlData', urlData)

    // 提交订单
    login.requestP_pro({
      url: `${config.postUrl+'order_submit'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      if (res.data.order_no) {

        // 订单提交成功后，购物车的选中状态清空
        app.globalData.selected_goods_list = []

        // 订单编号，订单总额
        that.setData({
          order_no: res.data.order_no,
          order_amount: res.data.order_amount,
        })

        if (that.data.payment_type == 1) {
          let order_amount = that.data.order_amount
          console.log('线上支付,订单金额order_amount：' + order_amount)
          // 订单金额大于0元才能发起微信支付
          // common.alert(res.msg)
          // 支付弹窗
          that.order_pay_pop()

        } else if (that.data.payment_type == 2) {
          // 提交成功,提示线下支付
          that.setData({
            pay_status: 3
          })
        }

      }


    }).catch((err) => {
      common.showErr(err)
    });
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
    let order_amount = that.data.order_amount
    let urlData = {
      order_no: that.data.order_no
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

          // 支付成功弹窗
          that.setData({
            pay_status: 1
          })
          that.order_pay_pop()

        },
        fail(err) {
          // common.showErr(err)

          // 支付失败弹窗
          // that.setData({
          //   pay_status: 2
          // })

          // 取消支付
          console.log('取消支付');
          // that.order_pay_pop()

        },
        complete(res) {
          // let url = '../../pages/mine/mine'
          // common.alert_url(res.msg, url)
          // // that.order_pay_pop()

        }
      })


    }).catch((err) => {
      // common.showErr(err)
    });
  },

  //团购下单流程：1.团购结算,id：团购id，quantity：购买数量
  gb_buy_now: function () {

    let that = this
    let urlData = wx.getStorageSync('gb_urlData')
    console.log('urlData', urlData)
    login.requestP_pro({
      url: `${config.postUrl + 'group_buying_submit'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      // common.alert(res.msg, "success")

      // // 预提交订单（ 团购订单）
      that.group_buying_order_pre_submit()

    }).catch((err) => {
      common.showErr(err)

    });
  },
  //团购下单流程：2.预提交订单（ 团购订单）,请先调用 团购结算 接口
  group_buying_order_pre_submit: function () {
    console.log('预提交订单（ 团购订单）')
    let that = this

    login.requestP_pro({
      url: `${config.postUrl + 'group_buying_order_pre_submit'}`,
      data: {}
    }).then((res) => {
      console.log('res', res)

      if (res.data) {
        that.setData({
          address: res.data.address,
          goods: res.data.goods,
          user_money: res.data.user_money,
          order_money: res.data.order_money,
          sum_money: res.data.user_money,
          address_id: res.data.address.id,
          totalPrice: res.data.order_money,
          no_address: false
        })
        console.log('that.data', that.data)
      }

      // 团购：钱包可用判断
      if (Number(that.data.user_money) < Number(that.data.order_money)) {
        that.setData({
          btn_wallet_disabled: true
        })
      }

      // let address_selected = getStorageSync('address_selected');
      if (that.data.address_selected) {
        // 选中的收货地址数据
        if (Object.keys(that.data.address_selected).length != 0) {
          that.setData({
            address: that.data.address_selected,
            address_id: that.data.address_selected.id,
            no_address: false
          })
          console.log('收货地址（必须）address_id改变的:' + that.data.address_id)
        }
      }

      // 手机号码加密处理
      if (that.data.address.mobile) {
        let mobile = that.data.address.mobile
        mobile = common.hide_mobile(mobile)
        that.setData({
          [`address.mobile`]: mobile
        })
      }
      console.log('收货地址（必须）address_id:' + that.data.address_id)


    }).catch((err) => {
      common.showErr(err)

    });
  },
  //团购下单流程：2.提交订单（普通订单）,请先调用 预提交订单（团购订单） 接口
  group_buying_order_submit: function () {
    let that = this
    let address_id = that.data.address_id
    let payment_type = that.data.payment_type
    let is_wallet = that.data.is_wallet

    let urlData = {
      address_id: address_id,
      payment_type: payment_type,
      is_wallet: is_wallet,
    }
    console.log('urlData', urlData)

    // 提交订单（团购订单）
    login.requestP_pro({
      url: `${config.postUrl+'group_buying_order_submit'}`,
      data: urlData
    }).then((res) => {
      console.log('res', res)
      if (res.data.order_no) {

        // 订单编号，订单总额
        that.setData({
          order_no: res.data.order_no,
          order_amount: res.data.order_amount,
        })

        if (that.data.payment_type == 1) {
          let order_amount = that.data.order_amount
          console.log('线上支付,订单金额order_amount：' + order_amount)
          // 订单金额大于0元才能发起微信支付
          // common.alert(res.msg)
          // 支付弹窗
          that.order_pay_pop()

        } else if (that.data.payment_type == 2) {
          // 提交成功,提示线下支付
          that.setData({
            pay_status: 3
          })
        }
      }
    }).catch((err) => {
      common.showErr(err)
    });
  },

})