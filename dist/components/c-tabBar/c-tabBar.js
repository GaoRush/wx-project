'use strict';

var config = require('../../assets/js/config.js');
// const tabBar_icon01 = '';


// components/c-tabBar/c-tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentTab: {
      type: String,
      value: '0'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    currentTab: 0,
    tabBarArray: [{
      "pagePath": "../../pages/index/index",
      "text": "首页",
      "iconPath": '../../assets/images/icon_home.png',
      "selectedIconPath": '../../assets/images/icon_home-on.png'
    }, {
      "pagePath": "../../pages/group_buying_list/group_buying_list",
      "text": "团购",
      "iconPath": '../../assets/images/icon_groupBuying.png',
      "selectedIconPath": '../../assets/images/icon_groupBuying-on.png'
    }, {
      "pagePath": "../../pages/coupon_list/coupon_list",
      "text": "优惠券",
      "iconPath": '../../assets/images/icon_coupon.png',
      "selectedIconPath": '../../assets/images/icon_coupon-on.png'
    }, {
      "pagePath": "../../pages/shopCart_list/shopCart_list",
      "text": "购物车",
      "iconPath": '../../assets/images/icon_myCart.png',
      "selectedIconPath": '../../assets/images/icon_myCart.png'
    }, {
      "pagePath": "../../pages/mine/mine",
      "text": "我的",
      "iconPath": '../../assets/images/icon_mine.png',
      "selectedIconPath": '../../assets/images/icon_mine-on.png'
    }]
  },

  /**
   * 组件的方法列表
   */
  methods: {
    switchTab: function switchTab(e) {
      var that = this;
      console.log(e);
      // this.setdata(){
      //   currentTab: e.currentTarget.dataset
      // }
      if (that.data.data == e.currentTarget.dataset.active) {
        return false;
      } else {
        that.setData({
          currentTab: e.currentTarget.dataset.active
        });
      }
    }
  }
});