'use strict';

var systemInfo = wx.getSystemInfoSync();

// components/c-statusBar/c-statusBar.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    'title': {
      type: String,
      value: ''
    },
    'sty': {
      type: String,
      value: ''
    },
    'isTransparent': {
      type: Boolean,
      value: false
    },
    'isBack': {
      type: Boolean,
      value: false
    },
    'statusBarAll': {
      type: Number,
      value: 0
    },
    'delta': {
      type: Number,
      value: 1
    },
    'navToUrl': {
      type: String,
      value: ''
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    statusBarStyle: '',
    navigationBarStyle: '',
    navigationStyle: '',
    menuStyle: '',
    navBar_height: 0,
    statusBarAll: 0
  },
  pageLifetimes: {
    // 组件所在页面的生命周期函数
    show: function show() {

      this.setData({
        statusBarStyle: this.getStatusBarStyle(),
        navigationBarStyle: this.getNavigationBarStyle(),
        navigationStyle: this.getNavigationStyle(),
        menuStyle: this.getMenuStyle(),
        navBar_height: this.getNavBar_height(),
        statusBarAll: this.getNavBar_height() + systemInfo.statusBarHeight
      });

      if (this.data.isTransparent) {
        wx.setNavigationBarColor({
          frontColor: '#ffffff',
          backgroundColor: '#ffffff'
        });
      }
    }
  },

  /**
   * 组件的方法列表
   */
  methods: {
    goBack: function goBack(res) {
      console.log('回退页面', this.data.delta);
      var curPages = getCurrentPages();
      console.log(curPages);
      wx.navigateBack({
        delta: this.data.delta
      });
    },

    goUrl: function goUrl(res) {
      console.log("跳转页面", this.data.navToUrl);
      wx.redirectTo({
        url: this.data.navToUrl
      });
    },
    /**
     * 获取胶囊按钮位置
     */
    getMenuPosition: function getMenuPosition() {
      var top = 4;
      var right = 7;
      var width = 87;
      var height = 32;
      if (systemInfo.platform === 'devtools' && systemInfo.system.indexOf('Android') === -1) {
        top = 6;
        right = 10;
      } else if (systemInfo.platform === 'devtools' && systemInfo.system.indexOf('Android') != -1) {
        top = 8;
        right = 10;
      } else if (systemInfo.system.indexOf('Android') != -1) {
        top = 8;
        right = 10;
        width = 95;
      }
      return {
        top: systemInfo.statusBarHeight + top,
        left: systemInfo.windowWidth - width - right,
        width: width,
        height: height
      };
    },

    /**
     * 获取状态栏样式
     */
    getStatusBarStyle: function getStatusBarStyle() {
      var statusBarPosition = {
        top: 0,
        left: 0,
        width: systemInfo.windowWidth,
        height: systemInfo.statusBarHeight
      };
      return this.formatStyle(statusBarPosition);
    },

    /**
     * 获取导航栏样式
     */
    getNavigationBarStyle: function getNavigationBarStyle() {
      var menuPosition = this.getMenuPosition();
      var navigationBarPosition = {
        top: systemInfo.statusBarHeight,
        left: 0,
        width: systemInfo.windowWidth,
        height: (menuPosition.top - systemInfo.statusBarHeight) * 2 + menuPosition.height
      };
      return this.formatStyle(navigationBarPosition);
    },


    /**
     * 获取导航样式
     */
    getNavigationStyle: function getNavigationStyle() {
      var menuPosition = this.getMenuPosition();
      var padding = systemInfo.windowWidth - menuPosition.left - menuPosition.width;
      var navigationPosition = {
        top: menuPosition.top,
        left: padding,
        width: systemInfo.windowWidth - padding * 3 - menuPosition.width,
        height: menuPosition.height
      };
      return this.formatStyle(navigationPosition);
    },

    /**
     * 获取胶囊按钮样式
     */
    getMenuStyle: function getMenuStyle() {
      return this.formatStyle(this.getMenuPosition());
    },

    /**
     * 
     */
    getNavBar_height: function getNavBar_height() {
      var menuPosition = this.getMenuPosition();
      var navBar_height = {
        height: (menuPosition.top - systemInfo.statusBarHeight) * 2 + menuPosition.height
      };
      return navBar_height.height;
    },


    /**
     * 格式化Style
     */
    formatStyle: function formatStyle(position) {
      var styles = [];
      for (var key in position) {
        styles.push(key + ': ' + position[key] + 'px;');
      }
      return styles.join(' ');
    }
  },
  behaviors: ['wx://component-export'],
  export: function _export() {
    this.setData({
      statusBarAll: this.getNavBar_height() + systemInfo.statusBarHeight
    });
    return this.data.statusBarAll;
  }
});