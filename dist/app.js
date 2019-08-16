'use strict';
//app.js

App({
  onLaunch: function onLaunch() {
    console.log('app-onLaunch');
  },
  onShow: function onShow() {
    console.log('app-onShow');
  },

  // 全局变量
  globalData: {
    userInfo: '',
    sKey: '',
    isLogin: ''
  }
});