'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '分类'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    statusBar_height: 0,
    goods_list: [],
    cid: 0,
    keyword: '',
    page_index: 1,
    page_size: 8,
    total_count: 0,
    isMore: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;
    console.log('options', options);
    if (options.cid) {
      // 有分类id
      that.setData(_defineProperty({
        cid: Number(options.cid)
      }, 'statusBar.title', options.title));
    }

    if (options.keyword) {
      // 有搜索关键词
      that.setData({
        keyword: options.keyword,
        inputVaue: options.keyword
      });
    }

    // 获取自定义导航的整体高度
    that.setData({
      statusBar_height: that.selectComponent('#statusBar')
    });

    // 获取产品列表
    that.get_goods_list();
    // 获取系统信息
    wx.getSystemInfo({
      success: function success(res) {
        // 可使用窗口宽度、高度
        // console.log('height=' + res.windowHeight)
        // console.log('width=' + res.windowWidth)
        // console.log('状态栏高度=' + res.statusBarHeight)
        // console.log('搜索栏高度=', '45px')

        // 计算主体部分高度,单位为px
        that.setData({
          // 滚动区域高度 = 利用窗口可使用高度 - 自定义导航头部高度-搜索栏高度
          scroll_main: res.windowHeight - that.data.statusBar_height - 45
        });
      }
    });
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
  onPullDownRefresh: function onPullDownRefresh() {
    console.log('下拉刷新');
    var that = this;
    that.setData({
      page_index: 1,
      page_size: 8,
      goods_list: [],
      isMore: true
    });
    that.get_goods_list();
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {
    console.log('上拉了');
    var that = this;
    // setTimeout模拟加载时间
    setTimeout(function () {
      that.loadMore();
    }, 500);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 获取产品列表
  get_goods_list: function get_goods_list() {
    // 加载
    common.show_loading();

    var that = this;
    console.log('that.data', that.data);
    login.requestP_pro({
      url: '' + (config.postUrl + 'goods_list'),
      data: {
        keyword: that.data.keyword,
        page_index: that.data.page_index,
        page_size: that.data.page_size,
        cid: that.data.cid
      }
    }, false).then(function (res) {

      console.log('goods_list', res);
      // 停止加载
      common.stop_loading(500);

      // 加载更多:2 拼接新数据
      var old_list = that.data.goods_list;
      var res_list = res.list;
      var new_list = old_list.concat(res_list);

      // 加载更多:3 赋值
      that.setData({
        goods_list: new_list,
        page_index: res.page_index,
        page_size: res.page_size,
        total_count: res.total_count,
        isMore: true
      });
      // console.log('goods_list', res)
    }).catch(function (err) {
      console.log('goods_list_err', err);
      common.showErr(err);
    });
  },

  // 搜索
  inputSearch: function inputSearch(e) {
    console.log('提交表单', e);
    // 获取用户输入框中的值
    var inputVaue = e.detail.value['search-input'] ? e.detail.value['search-input'] : e.detail.value;
    if (!inputVaue) {
      throw new Error('search input contents con not empty!');
      return;
    }
    var searchUrl = "../../pages/goods_list/goods_list?keyword=" + inputVaue;
    // let searchUrl = "/product/index?keyword=" + inputVaue + "&fromindex=true";
    // this.converterUrlAndRedirect(searchUrl);

    // 跳转搜索页面
    wx.navigateTo({
      url: searchUrl
    });
  },

  // 添加购物车
  bindAddCart: function bindAddCart(e) {
    console.log('e', e);
    var that = this;
    var goods_list = that.data.goods_list;
    var prdindex = e.currentTarget.dataset.prdindex;
    var goods_obj = {
      title: goods_list[prdindex].title,
      id: goods_list[prdindex].id,
      img_url: goods_list[prdindex].img_url,
      sell_price: goods_list[prdindex].sell_price
    };

    console.log('goods_obj', goods_obj);

    // 获取添加购物车插件
    var addCart = that.selectComponent('#addCart');
    addCart.addCart(goods_obj);
  },
  // 加载更多 4：加载更多
  loadMore: function loadMore() {
    var that = this;
    var page_index = that.data.page_index;
    var page_size = that.data.page_size;
    var total_count = that.data.total_count;
    var max_page_index = Math.ceil(total_count / page_size);
    if (total_count > 0) {
      page_index++;
      if (page_index > max_page_index) {
        that.setData({
          page_index: page_index - 1,
          isMore: false
        });
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index);
        console.log("无法加载更多");
        common.alert('没有更多了');
        return false;
      } else {
        that.setData({
          page_index: page_index,
          isMore: true
        });
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index);
        console.log("加载更多");
        // 获取列表
        that.get_goods_list();
      }
    }
  }
});