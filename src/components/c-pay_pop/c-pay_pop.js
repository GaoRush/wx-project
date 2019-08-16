'use strict';

var config = require('../../assets/js/config.js');
// const tabBar_icon01 = '';


// components/c-tabBar/c-tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    order_pay_pop: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
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
          },
          fail(err) {
            common.showErr(err)
          },
          complete(res) {
            let url = '../../pages/mine/mine'
            common.alert_url(res.msg, url)
            that.order_pay_pop()
          }
        })


      }).catch((err) => {
        common.showErr(err)
      });
    },
  }
});