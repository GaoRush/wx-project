'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

var WxParse = require('../../assets/wxParse/wxParse.js');

var setTime02 = void 0;

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '商品详情'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    // 商品id
    goodsId: 0,
    // 商品详情数据
    goods_detail: '',
    curNum: 1,
    // 收藏
    // is_collect: 0
    current_time: '',
    guess_you_like_list: [],
    is_countDown: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;
    console.log('options', options);
    if (options.gb_goodsId && options.isGroupBuying == 'true') {
      that.setData({
        gb_goodsId: Number(options.gb_goodsId),
        img_url: options.img_url ? options.img_url : '', //有商品图就存入没有就空
        isGroupBuying: true
        // [`statusBar.title`]: options.title
      });
      console.log('有团购id', that.data.gb_goodsId, that.data.isGroupBuying);
      // 获取团购商品详情
      that.group_buying_details();
    } else if (options.goodsId) {
      // 有商品id
      that.setData({
        goodsId: Number(options.goodsId),
        img_url: options.img_url ? options.img_url : '', //有商品图就存入没有就空
        isGroupBuying: false

        // [`statusBar.title`]: options.title
      });
      console.log('有商品id', that.data);
      // 获取商品详情
      that.get_goods_details();
    }

    // 分销商品推销下级
    if (options.user_id) {
      // 缓存分销id
      wx.setStorageSync('source_user_id', options.user_id);
      // common.alert('options.user_id' + options.user_id)

      that.setData({
        source_user_id: options.user_id
      });

      // 加入分销
      that.fx_children_add();
    } else {}
    // common.alert('没有options.user_id')


    // 猜你喜欢
    that.guess_you_like();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    this.setData({
      newCart: app.globalData.newCart
    });

    if (this.data.is_countDown == false && this.data.isGroupBuying) {
      // 开启定时器
      this.setData({
        is_countDown: true
      });
      this.countDown();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {
    // console.log('onHide清除定时器')
    // common.alert('清除定时器')
    if (this.data.isGroupBuying) {
      clearTimeout(setTime02);
      this.setData({
        is_countDown: false
      });
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {
    console.log('onUnload清除定时器');
    // common.alert('清除定时器')
    if (this.data.isGroupBuying) {
      clearTimeout(setTime02);
      this.setData({
        is_countDown: false
      });
    }
  },

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

  // 获取商品详情
  get_goods_details: function get_goods_details() {
    var that = this;
    console.log('that.data', that.data);
    login.requestP_pro({
      url: '' + (config.postUrl + 'goods_details'),
      data: {
        id: that.data.goodsId
      }
    }, 'optional').then(function (res) {
      console.log('goods_detail', res);
      that.setData({
        goods_detail: res.data
      });
      // 富文本
      var articleStr = res.data.content;
      WxParse.wxParse('article', 'html', articleStr, that, 5);

      // // 处理后台返回的-1的情况
      // if (that.data.goods_detail.collect_quantity < 0) {
      //   that.setData({
      //     [`goods_detail.collect_quantity`]: 0
      //   })
      // }

      console.log('goods_detail', that.data.goods_detail);
    }).catch(function (err) {
      console.log('goods_detail_err', err);
      common.showErr(err);
    });
  },

  // 商品图当前显示数字
  swiperChange: function swiperChange(e) {
    var that = this;
    var curNum = e.detail.current;
    var behavior = e.detail.source;
    // 根据切换行为来判断
    if (behavior == 'autoplay') {
      that.setData({
        curNum: curNum + 1
      });
    } else if (behavior == 'touch') {
      that.setData({
        curNum: curNum + 1
      });
    }
  },

  // 收藏
  bindCol: function bindCol(e) {
    var that = this;
    console.log('goods_detail', that.data.goods_detail);

    // 商品详情
    var goods_detail = that.data.goods_detail;
    // 收藏数量
    var collect_quantity = goods_detail.collect_quantity;
    // 是否收藏
    var is_collect = goods_detail.is_collect;
    // 收藏的商品id
    var goodsId = goods_detail.id;

    if (that.data.isGroupBuying && that.data.goods_detail.goods_id) {
      goodsId = that.data.goods_detail.goods_id;
      console.log('团购的商品id', goodsId);
    }

    login.requestP_pro({
      url: '' + (config.postUrl + 'collect_add'),
      data: {
        id: goodsId
      }
    }).then(function (res) {
      console.log('收藏', res);
      if (is_collect == 0) {
        var _that$setData;

        collect_quantity = Number(collect_quantity) + 1;
        that.setData((_that$setData = {}, _defineProperty(_that$setData, 'goods_detail.collect_quantity', collect_quantity), _defineProperty(_that$setData, 'goods_detail.is_collect', 1), _that$setData));
      } else if (is_collect == 1) {
        var _that$setData2;

        collect_quantity = Number(collect_quantity) - 1;
        that.setData((_that$setData2 = {}, _defineProperty(_that$setData2, 'goods_detail.collect_quantity', collect_quantity), _defineProperty(_that$setData2, 'goods_detail.is_collect', 0), _that$setData2));
      }
      console.log('goods_detail2', that.data.goods_detail);
      common.alert(res.msg);
    }).catch(function (err) {
      common.showErr(err);
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

  // 团购：获取商品详情
  group_buying_details: function group_buying_details() {
    var that = this;
    console.log('that.data', that.data);
    login.requestP_pro({
      url: '' + (config.postUrl + 'group_buying_details'),
      data: {
        id: that.data.gb_goodsId
      }
    }, 'optional').then(function (res) {
      console.log('group_buying_details', res);
      that.setData({
        goods_detail: res.data
      });
      // 富文本
      var articleStr = res.data.content;
      WxParse.wxParse('article', 'html', articleStr, that, 5);
      // 开团中
      if (that.data.goods_detail.status == 2) {
        // 团购：倒计时
        that.countDown();
      }
    }).catch(function (err) {
      console.log('goods_detail_err', err);
      common.showErr(err);
    });
  },

  // 当前团购拼团价格
  get_gb_price: function get_gb_price() {
    var that = this;
    var goods_detail = that.data.goods_detail;
    var gb_price = 0;
    var sales_volume = Number(goods_detail.sales_volume);
    var people1 = Number(goods_detail.people1);
    var people2 = Number(goods_detail.people2);
    var people3 = Number(goods_detail.people3);
    var price1 = Number(goods_detail.price1);
    var price2 = Number(goods_detail.price2);
    var price3 = Number(goods_detail.price3);
    var sell_price = Number(goods_detail.sell_price);

    if (sales_volume >= people3) {
      gb_price = price3;
    } else if (sales_volume >= people2) {
      gb_price = price2;
    } else if (sales_volume >= people1) {
      gb_price = price1;
    } else {
      gb_price = price1;
    }
    // 最低一级团价

    return gb_price;
    // that.setData({
    //   gb_price: gb_price
    // })
    console.log("that.data.gb_price:" + that.data.gb_price);
  },

  // 获取服务器当前时间
  get_current_time: function get_current_time() {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var that = _this;
      // console.log('that.data', that.data)
      login.requestP_pro({
        url: '' + (config.postUrl + 'group_buying_list'),
        data: {
          page_index: that.data.page_index,
          page_size: that.data.page_size,
          keyword: that.data.keyword
        }
      }, false).then(function (res) {
        that.setData({
          current_time: res.current_time
        });
        console.log('current_time', that.data.current_time);
        resolve(that.data.current_time);
      }).catch(function (err) {
        common.showErr(err);
      });
    });
  },

  timeFormat: function timeFormat(param) {
    //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },

  // 团购：倒计时
  countDown: function countDown() {
    var _this2 = this;

    //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    if (this.data.is_countDown) {
      this.get_current_time().then(function (res) {
        var newTime = parseInt(res.substr(6, 13));
        var end_time = parseInt(_this2.data.goods_detail.end_time.substr(6, 13));
        var start_time = parseInt(_this2.data.goods_detail.start_time.substr(6, 13));
        var countDownArr = [];
        // console.log('newTime:' + newTime + 'end_time:' + end_time + "start_time:" + start_time)

        // 对结束时间进行处理渲染到页面
        var endTime = new Date(end_time).getTime();
        var obj = null;
        // 如果活动未结束，对时间进行处理
        if (endTime - newTime > 0) {
          var time = (endTime - newTime) / 1000;
          // 获取天、时、分、秒
          var day = parseInt(time / (60 * 60 * 24));
          var hou = parseInt(time % (60 * 60 * 24) / 3600);
          var min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
          var sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
          obj = {
            day: _this2.timeFormat(day),
            hou: _this2.timeFormat(hou),
            min: _this2.timeFormat(min),
            sec: _this2.timeFormat(sec)
          };
        } else {
          //活动已结束，全部设置为'00'
          obj = {
            day: '00',
            hou: '00',
            min: '00',
            sec: '00'
          };
        }
        countDownArr.push(obj);

        _this2.setData({
          countDownList: countDownArr
        });
        // 渲染，然后每隔一秒执行一次倒计时函数
        setTime02 = setTimeout(_this2.countDown, 1000);

        // console.log('countDownList', this.data.countDownList)
      }).catch(function (err) {
        common.showErr(err);
      });
    }
  },

  // 添加购物车弹窗
  addCart_pop: function addCart_pop(e) {
    var that = this;
    var goods_obj = {};
    // 猜你喜欢
    if (e.currentTarget.dataset.prdindex >= 0) {
      console.log("猜你喜欢购物车弹窗", e.currentTarget.dataset);
      var guess_you_like_list = that.data.guess_you_like_list;
      var prdindex = e.currentTarget.dataset.prdindex;
      goods_obj = {
        title: guess_you_like_list[prdindex].title,
        id: guess_you_like_list[prdindex].id,
        img_url: guess_you_like_list[prdindex].img_url,
        sell_price: guess_you_like_list[prdindex].sell_price
      };
    } else {
      console.log("商品/团购详情弹窗");

      // 商品详情
      var goods_detail = that.data.goods_detail;

      // console.log('goods_detail', goods_detail)

      var sell_price = 0;
      // 团购价
      if (that.data.isGroupBuying) {
        // 当前团购拼团价格
        var gb_price = that.get_gb_price();
        console.log('gb_price', gb_price);
        sell_price = gb_price;
      } else {
        // 普通商品价
        sell_price = goods_detail.sell_price;
      }

      goods_obj = {
        title: goods_detail.title,
        id: goods_detail.id,
        img_url: that.data.img_url,
        sell_price: sell_price
      };
    }

    console.log('goods_obj', goods_obj);
    return goods_obj;
  },

  // 添加购物车
  bindAddCart: function bindAddCart(e) {
    var that = this;
    // 添加购物车弹窗
    var goods_obj = that.addCart_pop(e);

    // 获取添加购物车插件
    var addCart = that.selectComponent('#addCart');
    addCart.addCart(goods_obj);

    var btnType = e.currentTarget.dataset.btntype;

    if (btnType) {
      // 展示确定按钮
      addCart.showSure(btnType);
    }
  },

  // 团购：添加购物车
  gb_bindAddCart: function gb_bindAddCart(e) {
    var that = this;
    // 添加购物车弹窗
    var goods_obj = that.addCart_pop(e);

    // 获取添加购物车插件
    var addCart = that.selectComponent('#addCart');
    addCart.gb_addCart(goods_obj);

    var btnType = e.currentTarget.dataset.btntype;
    if (btnType) {
      // 展示确定按钮
      addCart.showSure(btnType);
    }
  },
  // 加入分销团队
  fx_children_add: function fx_children_add() {
    var that = this;
    var api_name = 'fx_children_add';
    var urlData = {
      source_user_id: that.data.source_user_id
    };
    login.requestP_pro({
      url: config.postUrl + api_name,
      data: urlData
    }).then(function (res) {
      common.alert(res);
    }).catch(function (err) {
      // common.showErr(err)
    });
  },

  /* 转发*/
  onShareAppMessage: function onShareAppMessage(options) {
    var that = this;
    console.log('options', options);
    var goods_detail = that.data.goods_detail;
    console.log('that.data', that.data);

    if (options.from === "button") {
      // 来自页面内转发按钮
      console.log(options.target);
      // common.showErr('转发成功')
    }

    // url = "{{'../../pages/goods_detail/goods_detail?gb_goodsId='+ item.id + '&img_url='+item.img_url+'&isGroupBuying=true' }}"

    // 普通商品详情
    var url = 'pages/goods_detail/goods_detail?goodsId=' + goods_detail.id + '&user_id=' + goods_detail.user_id;
    // 团购详情
    if (that.data.isGroupBuying) {
      url = 'pages/goods_detail/goods_detail?gb_goodsId=' + goods_detail.id + '&img_url=' + that.data.img_url + '&isGroupBuying=true' + '&user_id=' + goods_detail.user_id;
    }
    console.log('url', url);
    return {
      title: goods_detail.title,
      imageUrl: goods_detail.albums[0],
      path: url,
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