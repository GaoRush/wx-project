'use strict';

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

// components/c-statusBar/c-statusBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    isGroupBuying: Boolean,
    showCart: Boolean
  },

  /**
   * 组件的初始数据
   */
  data: {
    showCart: false,
    num: 1,
    minusStatus: 'disabled',
    goods_obj: {},
    url: config.url
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function show() {
      if (app.globalData.newCart) {
        this.setData({
          newCart: app.globalData.newCart
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    addCart: function addCart(goods_obj) {
      var that = this;
      that.showCart();
      // 判断商品对象是否为空
      if (Object.keys(goods_obj).length != 0) {
        that.setData({
          goods_obj: goods_obj,
          isGroupBuying: false
        });
        console.log('goods_obj', that.data.goods_obj);
      }
    },
    // 每次显示添加购物车窗口都重置数量
    showCart: function showCart() {
      var that = this;
      that.setData({
        showCart: !that.data.showCart,
        num: 1,
        minusStatus: 'disabled',
        showSure: false
      });
    },

    // 点击减号
    bindMinus: function bindMinus() {
      var that = this;
      var num = that.data.num;
      // 大于1时才可以减
      if (num > 1) {
        num--;
      }
      // 只有大于一件的时候，才能normal状态，否则disable状态  
      var minusStatus = num <= 1 ? 'disabled' : 'normal';
      that.setData({
        num: num,
        minusStatus: minusStatus
      });
    },

    // 点击加号
    bindPlus: function bindPlus() {
      var that = this;
      var num = that.data.num;
      num++;
      // 只有大于一件的时候，才能normal状态，否则disabled状态  
      var minusStatus = num < 1 ? 'disabled' : 'normal';
      that.setData({
        num: num,
        minusStatus: minusStatus
      });
    },
    bindInput: function bindInput(e) {
      var that = this;
      var num = e.detail.value;
      var minusStatus = num < 1 ? 'disabled' : 'normal';

      if (num <= 0) {
        wx.showToast({
          title: '不能再少了!',
          icon: 'none'
        });
        that.setData({
          num: 1,
          minusStatus: 'disabled'
        });
        return false;
      }
      that.setData({
        num: num
      });
    },
    // 添加到购物车
    submitToCart: function submitToCart() {
      var that = this;
      login.requestP_pro({
        url: '' + (config.postUrl + 'cart_add'),
        data: {
          id: that.data.goods_obj.id,
          quantity: that.data.num
        }
      }).then(function (res) {
        console.log('res', res);

        // 添加完购物车出现提示点
        that.setData({
          newCart: true
        });
        app.globalData.newCart = true;

        common.alert(res.msg, "success");
        // 添加完购物车，关闭添加窗
        that.showCart();
      }).catch(function (err) {
        common.showErr(err);
      });
    },

    // 更新购物车
    // updateCart: function (shopcartid, quantity) {
    //   console.log('shopcartid', shopcartid)
    //   console.log('quantity', quantity)
    //   let that = this
    //   console.log('执行更新购物车')
    //   login
    //     .requestP_pro({
    //       url: `${config.postUrl + 'cart_update'}`,
    //       data: {
    //         id: shopcartid,
    //         quantity: quantity
    //       }
    //     })
    //     .then(res => {
    //       console.log('res', res)
    //       // 重新获取购物车列表
    //       that.get_cart_list()
    //       // common.alert(res.msg, 'success')
    //     })
    //     .catch(err => {
    //       common.showErr(err)
    //     })
    // },


    // 购物车结算预提交
    cart_submit_pre: function cart_submit_pre() {
      var that = this;
      that.get_address_list();
    },

    buy_now: function buy_now() {
      // 添加购物车
      var that = this;
      var urlData = {
        id: that.data.goods_obj.id,
        quantity: that.data.num
      };
      console.log('urlData', urlData);
      login.requestP_pro({
        url: '' + (config.postUrl + 'buy_now'),
        data: urlData
      }).then(function (res) {
        console.log('res', res);
        // common.alert(res.msg, "success")
        // that.get_cart_list()
        // that.cart_submit()
        // 跳转到订单确认页面
        wx.navigateTo({
          url: '../../pages/order_submit/order_submit?buy_now=1'
        });
      }).catch(function (err) {
        common.showErr(err);
      });
    },

    // 立即购买：购物车结算
    cart_submit: function cart_submit() {
      var that = this;
      var cart_list = that.data.cart_list;
      var goods_id = that.data.goods_obj.id;
      var id_list = '';
      for (var i = 0; i < cart_list.length; i++) {
        if (cart_list[i].goods_id == goods_id) {
          id_list = cart_list[i].id;
          break;
        }
      }
      console.log('id_list', id_list);
      login.requestP_pro({
        url: '' + (config.postUrl + 'cart_submit'),
        data: {
          id_list: id_list
        }
      }).then(function (res) {
        console.log('res', res);
        // 跳转到订单确认页面
        wx.navigateTo({
          url: '' + ('../../pages/order_submit/order_submit?id_list=' + id_list)
        });
      }).catch(function (err) {
        common.showErr(err);
      });
    },
    // 收货地址列表
    get_address_list: function get_address_list() {
      var that = this;
      login.requestP_pro({
        url: '' + (config.postUrl + "address_list"),
        data: {}
      }).then(function (res) {
        console.log('res', res);

        var address_list = res.list;

        if (!address_list.length > 0) {
          var url = "../../pages/address_list/address_list";
          common.alert_url('请先填写收货地址', 'none', true, url);
        } else {

          if (that.data.isGroupBuying == true) {
            console.log('团购：立即购买');
            // 团购：立即购买
            that.gb_buy_now();
          } else {
            console.log('普通立即购买');
            // 普通立即购买
            that.buy_now();
          }
        }
      }).catch(function (err) {
        common.showErr(err);
      });
    },

    // 获取购物车列表
    get_cart_list: function get_cart_list() {
      var that = this;

      login.requestP_pro({
        url: '' + (config.postUrl + 'cart_list'),
        data: {}
      }).then(function (res) {
        console.log('res', res);
        if (res) {
          that.setData({
            cart_list: res.data
          });
          console.log('cart_list', that.data.cart_list);
          that.cart_submit();
        }
      }).catch(function (err) {
        common.showErr(err);
      });
    },

    // 团购：
    gb_addCart: function gb_addCart(goods_obj) {
      var that = this;
      that.showCart();

      // 判断商品对象是否为空
      if (Object.keys(goods_obj).length != 0) {
        that.setData({
          goods_obj: goods_obj,
          isGroupBuying: true
        });
        console.log('goods_obj', that.data.goods_obj);
      }
      console.log('addCart');
    },
    //团购下单流程：1.团购结算
    gb_buy_now: function gb_buy_now() {

      var that = this;
      var urlData = {
        id: that.data.goods_obj.id,
        quantity: that.data.num
      };
      console.log('urlData', urlData);

      // 团购结算参数转字符串传参
      var urlData_str = JSON.stringify(urlData);
      console.log('urlData_str', urlData_str);

      login.requestP_pro({
        url: '' + (config.postUrl + 'group_buying_submit'),
        data: urlData
      }).then(function (res) {
        console.log('res', res);
        // common.alert(res.msg, "success")
        // 跳转到订单确认页面
        wx.navigateTo({
          url: '' + ('../../pages/order_submit/order_submit?gb_urlData=' + urlData_str)
        });

        // // 预提交订单（ 团购订单）
        // that.group_buying_order_pre_submit()
      }).catch(function (err) {
        common.showErr(err);
      });
    },
    // 团购下单流程：2.预提交订单（ 团购订单）
    // group_buying_order_pre_submit: function () {
    //   console.log('预提交订单（ 团购订单）')
    //   let that = this

    //   login.requestP_pro({
    //     url: `${config.postUrl + 'group_buying_order_pre_submit'}`,
    //     data: {}
    //   }).then((res) => {
    //     console.log('res', res)

    //     if (res.data) {
    //       that.setData({
    //         address: res.data.address,
    //         goods: res.data.goods,
    //         user_money: res.data.user_money,
    //         order_money: res.data.order_money,
    //       })

    //       console.log('that.data', that.data)
    //     }


    //   }).catch((err) => {
    //     common.showErr(err)

    //   });
    // }


    // 显示确定按钮
    showSure: function showSure(btnType) {
      var that = this;
      console.log(btnType);
      if (btnType == 'buy') {
        that.setData({
          bind_click: 'cart_submit_pre',
          showSure: true
        });
      } else if (btnType == 'gb_buy') {
        that.setData({
          bind_click: 'cart_submit_pre',
          showSure: true

        });
      } else if (btnType == 'addCart') {
        that.setData({
          bind_click: 'submitToCart',
          showSure: true

        });
      }
    }
  }
});