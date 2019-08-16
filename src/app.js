'use strict'
//app.js
App({
  onLaunch: function () {
    console.log('app-onLaunch')
  },
  onShow: function () {
    console.log('app-onShow');
  },

  // 全局变量
  globalData: {
    userInfo: '',
    sKey: '',
    isLogin: '',
  }
})