'use strict';

var config = require('../../assets/js/config.js');
// const tabBar_icon01 = '';


// components/c-tabBar/c-tabBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    goTop: function goTop(e) {
      console.log('e.detail', e.detail);
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 1000
      });
    }
  }
});