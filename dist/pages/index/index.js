'use strict';

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login02.js');
var http = require('../../assets/js/http.js');
var app = getApp();

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '',
      sty: "" //标题位置图片
    },
    url: config.url,
    imgUrl: config.imgUrl,
    // banner
    banner_list: [],
    // 分类列表
    category_list: [],
    // 推荐商品列表
    goods_list: [],
    // 猜你喜欢
    guess_you_like_list: [],
    // 搜索关键词
    keyword: '',
    inputValue: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;

    console.log('options', options);

    // 扫描识码推销下级
    // if (options.scene) {
    //   console.log("扫描进入，has scene");
    //   let scene = decodeURIComponent(options.scene);
    //   console.log("scene is ", scene);
    //   // var arrPara = scene.split("&");
    //   // var arr = [];
    //   // for (var i in arrPara) {
    //   //   arr = arrPara[i].split("=");
    //   //   wx.setStorageSync(arr[0], arr[1]);
    //   //   console.log("setStorageSync:", arr[0], "=", arr[1]);
    //   // }
    //   // 获取的一级用户id
    //   that.setData({
    //     source_user_id: scene
    //   })
    //   console.log("缓存分销id，source_user_id:" + that.data.source_user_id)
    //   // 缓存分销id
    //   wx.setStorageSync('source_user_id', scene);

    //   // 执行加入分销团队
    //   console.log('执行加入分销团队');

    //   if (that.data.source_user_id) {
    //     that.fx_children_add()
    //   }

    // } else {
    //   console.log("no scene");
    //   // common.alert('no scene，获取缓存id加入分销')
    //   let source_user_id = wx.getStorageSync('source_user_id');
    //   that.setData({
    //     source_user_id: source_user_id
    //   })
    //   // 执行加入分销团队
    //   console.log('执行加入分销团队');

    //   if (that.data.source_user_id) {
    //     that.fx_children_add()
    //   }
    // }

    // // 分享首页推销下级
    // if (options.user_id) {
    //   // 缓存分销id
    //   wx.setStorageSync('source_user_id', options.user_id);
    //   // common.alert('options.user_id' + options.user_id)

    //   that.setData({
    //     source_user_id: options.user_id
    //   })

    //   // 加入分销
    //   that.fx_children_add()
    // } else {
    //   // common.alert('没有options.user_id')
    // }

    // 获取列表数据
    that.getLsit();
    // that.guess_you_like()
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
    wx.stopPullDownRefresh();
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  // /**
  //  * 用户点击右上角分享
  //  */
  // onShareAppMessage: function onShareAppMessage() {},

  // 获取列表数据
  getLsit: function getLsit() {
    var that = this;

    var urlData = {};
    console.log("urlData", urlData);
    // login.requestP_pro({
    //   url: `${config.postUrl+'index'}`,
    //   data: urlData
    // }).then((res) => {
    //   console.log('getLsit-res', res)

    //   that.setData({
    //     banner_list: res.banner_list,
    //     category_list: res.category_list,
    //     goods_list: res.goods_list,
    //     user_id: res.user_id
    //   })
    // }).catch((err) => {
    //   common.showErr(err)

    // });


    console.log("执行请求");
    http.fly.get(config.postUrl + "index", {}).then(function (res) {
      //输出请求数据
      console.log("输出请求数据", res.data);
      //输出响应头
      console.log("输出响应头", res.headers);

      that.setData({
        banner_list: res.data.banner_list,
        category_list: res.data.category_list,
        goods_list: res.data.goods_list,
        user_id: res.data.user_id
      });
    }).catch(function (err) {
      console.log(err.status, err.message);
    });
  },

  // // 文本输入
  // input_text: function (e) {
  //   let that = this
  //   console.log('正在输入', e)

  //   // 获取用户输入框中的值
  //   that.setData({
  //     inputValue: e.detail.value
  //   });

  //   console.log('that.data.inputValue', that.data.inputValue)
  //   common.checkUserName(that.data.inputValue)

  // },

  // 搜索
  inputSearch: function inputSearch(e) {
    var that = this;
    console.log('form发生了submit事件，携带数据为：', e.detail.value);
    // 获取用户输入框中的值
    var inputVaue = e.detail.value['search-input'] ? e.detail.value['search-input'] : e.detail.value;
    if (!inputVaue) {
      throw new Error('search input contents con not empty!');
      return;
    }
    that.setData({
      keyword: inputVaue
    });
    var searchUrl = "../../pages/goods_list/goods_list?keyword=" + inputVaue;

    // 跳转搜索页面
    wx.navigateTo({
      url: searchUrl
    });
  },

  // 猜你喜欢
  guess_you_like: function guess_you_like() {
    var that = this;
    var api_name = 'guess_you_like';
    login.requestP_pro({
      url: config.postUrl + api_name,
      data: {}
    }, 'optional').then(function (res) {
      console.log('guess_you_like', res);
      that.setData({
        guess_you_like_list: res.list
      });
    }).catch(function (err) {
      common.showErr(err);
    });
  },

  // 添加购物车
  bindAddCart: function bindAddCart(e) {
    console.log('e', e);
    var that = this;
    var goods_list = that.data.guess_you_like_list;
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
  // 加入分销团队
  fx_children_add: function fx_children_add() {
    console.log('加入分销团队');

    var that = this;
    var api_name = 'fx_children_add';
    var urlData = {
      source_user_id: that.data.source_user_id
    };
    login.requestP_pro({
      url: config.postUrl + api_name,
      data: urlData
    }).then(function (res) {
      // common.alert(res.msg)
    }).catch(function (err) {
      // common.showErr(err)
    });
  },

  /* 转发*/
  onShareAppMessage: function onShareAppMessage(options) {
    var that = this;
    console.log('options', options);
    var user_id = that.data.user_id;
    // console.log('user_id', user_id);
    // let msg = `${user_id}`
    // common.alert(msg)
    // if (options.from === "menu") {
    //   // 来自页面内转发按钮
    //   console.log(options.target)
    //   // common.showErr('转发成功')
    // }
    return {
      title: '广州多得服务',
      // imageUrl: goods_detail.albums[0],
      path: '' + ('pages/index/index?user_id=' + user_id),
      success: function success(res) {
        console.log('res', res);
        // 转发成功
        console.log("转发成功1:" + JSON.stringify(res));
        common.showErr('转发成功1');
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        //可以获取群组信息
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function success(res) {
            console.log('可以获取群组信息', res);
          }
        });
      },
      fail: function fail(res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        common.showErr('转发失败');
      }
    };
  }

});