'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
const app = getApp()


const WxParse = require('../../assets/wxParse/wxParse.js');

let setTime02

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
    let that = this
    console.log('options', options)
    if (options.gb_goodsId && (options.isGroupBuying == 'true')) {
      that.setData({
        gb_goodsId: Number(options.gb_goodsId),
        img_url: options.img_url ? options.img_url : '', //有商品图就存入没有就空
        isGroupBuying: true
        // [`statusBar.title`]: options.title
      })
      console.log('有团购id', that.data.gb_goodsId, that.data.isGroupBuying)
      // 获取团购商品详情
      that.group_buying_details()
    } else if (options.goodsId) {
      // 有商品id
      that.setData({
        goodsId: Number(options.goodsId),
        img_url: options.img_url ? options.img_url : '', //有商品图就存入没有就空
        isGroupBuying: false,

        // [`statusBar.title`]: options.title
      })
      console.log('有商品id', that.data)
      // 获取商品详情
      that.get_goods_details()
    }


    // 分销商品推销下级
    if (options.user_id) {
      // 缓存分销id
      wx.setStorageSync('source_user_id', options.user_id);
      // common.alert('options.user_id' + options.user_id)

      that.setData({
        source_user_id: options.user_id
      })

      // 加入分销
      that.fx_children_add()
    } else {
      // common.alert('没有options.user_id')
    }



    // 猜你喜欢
    that.guess_you_like()
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
    })

    if (this.data.is_countDown == false && this.data.isGroupBuying) {
      // 开启定时器
      this.setData({
        is_countDown: true
      })
      this.countDown()
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function onHide() {
    // console.log('onHide清除定时器')
    // common.alert('清除定时器')
    if (this.data.isGroupBuying) {
      clearTimeout(setTime02)
      this.setData({
        is_countDown: false
      })
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {
    console.log('onUnload清除定时器')
    // common.alert('清除定时器')
    if (this.data.isGroupBuying) {
      clearTimeout(setTime02)
      this.setData({
        is_countDown: false
      })
    }
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {

    wx.stopPullDownRefresh()

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
  get_goods_details: function () {
    let that = this
    console.log('that.data', that.data)
    login
      .requestP_pro({
        url: `${config.postUrl + 'goods_details'}`,
        data: {
          id: that.data.goodsId,
        }
      }, 'optional')
      .then(res => {
        console.log('goods_detail', res)
        that.setData({
          goods_detail: res.data,
        })
        // 富文本
        var articleStr = res.data.content;
        WxParse.wxParse('article', 'html', articleStr, that, 5);

        // // 处理后台返回的-1的情况
        // if (that.data.goods_detail.collect_quantity < 0) {
        //   that.setData({
        //     [`goods_detail.collect_quantity`]: 0
        //   })
        // }

        console.log('goods_detail', that.data.goods_detail)
      })
      .catch(err => {
        console.log('goods_detail_err', err)
        common.showErr(err)
      })
  },

  // 商品图当前显示数字
  swiperChange: function (e) {
    let that = this
    let curNum = e.detail.current
    let behavior = e.detail.source
    // 根据切换行为来判断
    if (behavior == 'autoplay') {
      that.setData({
        curNum: curNum + 1
      })
    } else if (behavior == 'touch') {
      that.setData({
        curNum: curNum + 1
      })
    }

  },


  // 收藏
  bindCol: function (e) {
    let that = this
    console.log('goods_detail', that.data.goods_detail)

    // 商品详情
    let goods_detail = that.data.goods_detail
    // 收藏数量
    let collect_quantity = goods_detail.collect_quantity
    // 是否收藏
    let is_collect = goods_detail.is_collect
    // 收藏的商品id
    let goodsId = goods_detail.id

    if (that.data.isGroupBuying && that.data.goods_detail.goods_id) {
      goodsId = that.data.goods_detail.goods_id
      console.log('团购的商品id', goodsId)
    }

    login.requestP_pro({
      url: `${config.postUrl + 'collect_add'}`,
      data: {
        id: goodsId
      }
    }).then((res) => {
      console.log('收藏', res)
      if (is_collect == 0) {
        collect_quantity = Number(collect_quantity) + 1
        that.setData({
          [`goods_detail.collect_quantity`]: collect_quantity,
          [`goods_detail.is_collect`]: 1,
        })
      } else if (is_collect == 1) {
        collect_quantity = Number(collect_quantity) - 1
        that.setData({
          [`goods_detail.collect_quantity`]: collect_quantity,
          [`goods_detail.is_collect`]: 0,
        })
      }
      console.log('goods_detail2', that.data.goods_detail)
      common.alert(res.msg)


    }).catch((err) => {
      common.showErr(err)
    });
  },

  // 猜你喜欢
  guess_you_like: function () {
    let that = this
    let api_name = 'guess_you_like'
    login.requestP_pro({
      url: config.postUrl + api_name,
      data: {}
    }, 'optional').then((res) => {
      console.log('guess_you_like', res)
      that.setData({
        guess_you_like_list: res.list
      })
    }).catch((err) => {
      common.showErr(err)
    });
  },

  // 团购：获取商品详情
  group_buying_details: function () {
    let that = this
    console.log('that.data', that.data)
    login
      .requestP_pro({
        url: `${config.postUrl + 'group_buying_details'}`,
        data: {
          id: that.data.gb_goodsId,
        }
      }, 'optional')
      .then(res => {
        console.log('group_buying_details', res)
        that.setData({
          goods_detail: res.data,
        })
        // 富文本
        var articleStr = res.data.content;
        WxParse.wxParse('article', 'html', articleStr, that, 5);
        // 开团中
        if (that.data.goods_detail.status == 2) {
          // 团购：倒计时
          that.countDown()
        }

      })
      .catch(err => {
        console.log('goods_detail_err', err)
        common.showErr(err)
      })
  },

  // 当前团购拼团价格
  get_gb_price: function () {
    let that = this
    let goods_detail = that.data.goods_detail
    let gb_price = 0
    let sales_volume = Number(goods_detail.sales_volume)
    let people1 = Number(goods_detail.people1)
    let people2 = Number(goods_detail.people2)
    let people3 = Number(goods_detail.people3)
    let price1 = Number(goods_detail.price1)
    let price2 = Number(goods_detail.price2)
    let price3 = Number(goods_detail.price3)
    let sell_price = Number(goods_detail.sell_price)

    if (sales_volume >= people3) {
      gb_price = price3
    } else if (sales_volume >= people2) {
      gb_price = price2
    } else if (sales_volume >= people1) {
      gb_price = price1
    } else {
      gb_price = price1
    }
    // 最低一级团价

    return gb_price
    // that.setData({
    //   gb_price: gb_price
    // })
    console.log("that.data.gb_price:" + that.data.gb_price)
  },

  // 获取服务器当前时间
  get_current_time: function () {
    return new Promise((resolve, reject) => {
      let that = this
      // console.log('that.data', that.data)
      login
        .requestP_pro({
            url: `${config.postUrl + 'group_buying_list'}`,
            data: {
              page_index: that.data.page_index,
              page_size: that.data.page_size,
              keyword: that.data.keyword,
            }
          },
          false
        )
        .then(res => {
          that.setData({
            current_time: res.current_time
          })
          console.log('current_time', that.data.current_time)
          resolve(that.data.current_time)
        })
        .catch(err => {
          common.showErr(err)
        })

    })
  },

  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  // 团购：倒计时
  countDown() { //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    if (this.data.is_countDown) {
      this.get_current_time().then((res) => {
        let newTime = parseInt(res.substr(6, 13));
        let end_time = parseInt(this.data.goods_detail.end_time.substr(6, 13));
        let start_time = parseInt(this.data.goods_detail.start_time.substr(6, 13));
        let countDownArr = [];
        // console.log('newTime:' + newTime + 'end_time:' + end_time + "start_time:" + start_time)

        // 对结束时间进行处理渲染到页面
        let endTime = new Date(end_time).getTime();
        let obj = null;
        // 如果活动未结束，对时间进行处理
        if (endTime - newTime > 0) {
          let time = (endTime - newTime) / 1000;
          // 获取天、时、分、秒
          let day = parseInt(time / (60 * 60 * 24));
          let hou = parseInt(time % (60 * 60 * 24) / 3600);
          let min = parseInt(time % (60 * 60 * 24) % 3600 / 60);
          let sec = parseInt(time % (60 * 60 * 24) % 3600 % 60);
          obj = {
            day: this.timeFormat(day),
            hou: this.timeFormat(hou),
            min: this.timeFormat(min),
            sec: this.timeFormat(sec)
          }
        } else { //活动已结束，全部设置为'00'
          obj = {
            day: '00',
            hou: '00',
            min: '00',
            sec: '00'
          }
        }
        countDownArr.push(obj);

        this.setData({
          countDownList: countDownArr
        })
        // 渲染，然后每隔一秒执行一次倒计时函数
        setTime02 = setTimeout(this.countDown, 1000);


        // console.log('countDownList', this.data.countDownList)
      }).catch((err) => {
        common.showErr(err)
      });
    }
  },
  // 添加购物车弹窗
  addCart_pop: function (e) {
    let that = this
    let goods_obj = {}
    // 猜你喜欢
    if (e.currentTarget.dataset.prdindex >= 0) {
      console.log("猜你喜欢购物车弹窗", e.currentTarget.dataset)
      let guess_you_like_list = that.data.guess_you_like_list
      let prdindex = e.currentTarget.dataset.prdindex
      goods_obj = {
        title: guess_you_like_list[prdindex].title,
        id: guess_you_like_list[prdindex].id,
        img_url: guess_you_like_list[prdindex].img_url,
        sell_price: guess_you_like_list[prdindex].sell_price,
      }

    } else {
      console.log("商品/团购详情弹窗")

      // 商品详情
      let goods_detail = that.data.goods_detail

      // console.log('goods_detail', goods_detail)

      let sell_price = 0;
      // 团购价
      if (that.data.isGroupBuying) {
        // 当前团购拼团价格
        let gb_price = that.get_gb_price()
        console.log('gb_price', gb_price)
        sell_price = gb_price
      } else {
        // 普通商品价
        sell_price = goods_detail.sell_price
      }

      goods_obj = {
        title: goods_detail.title,
        id: goods_detail.id,
        img_url: that.data.img_url,
        sell_price: sell_price,
      }
    }

    console.log('goods_obj', goods_obj)
    return goods_obj
  },

  // 添加购物车
  bindAddCart: function (e) {
    let that = this
    // 添加购物车弹窗
    let goods_obj = that.addCart_pop(e)

    // 获取添加购物车插件
    let addCart = that.selectComponent('#addCart')
    addCart.addCart(goods_obj)

    let btnType = e.currentTarget.dataset.btntype

    if (btnType) {
      // 展示确定按钮
      addCart.showSure(btnType)
    }
  },


  // 团购：添加购物车
  gb_bindAddCart: function (e) {
    let that = this
    // 添加购物车弹窗
    let goods_obj = that.addCart_pop(e)

    // 获取添加购物车插件
    let addCart = that.selectComponent('#addCart')
    addCart.gb_addCart(goods_obj)

    let btnType = e.currentTarget.dataset.btntype
    if (btnType) {
      // 展示确定按钮
      addCart.showSure(btnType)
    }
  },
  // 加入分销团队
  fx_children_add: function () {
    let that = this
    let api_name = 'fx_children_add'
    let urlData = {
      source_user_id: that.data.source_user_id
    }
    login.requestP_pro({
      url: config.postUrl + api_name,
      data: urlData
    }).then((res) => {
      common.alert(res)
    }).catch((err) => {
      // common.showErr(err)
    });
  },

  /* 转发*/
  onShareAppMessage: function (options) {
    let that = this
    console.log('options', options)
    let goods_detail = that.data.goods_detail
    console.log('that.data', that.data);

    if (options.from === "button") {
      // 来自页面内转发按钮
      console.log(options.target)
      // common.showErr('转发成功')
    }

    // url = "{{'../../pages/goods_detail/goods_detail?gb_goodsId='+ item.id + '&img_url='+item.img_url+'&isGroupBuying=true' }}"

    // 普通商品详情
    let url = 'pages/goods_detail/goods_detail?goodsId=' + goods_detail.id + '&user_id=' + goods_detail.user_id
    // 团购详情
    if (that.data.isGroupBuying) {
      url = 'pages/goods_detail/goods_detail?gb_goodsId=' + goods_detail.id + '&img_url=' + that.data.img_url + '&isGroupBuying=true' + '&user_id=' + goods_detail.user_id
    }
    console.log('url', url);
    return {
      title: goods_detail.title,
      imageUrl: goods_detail.albums[0],
      path: url,
      success: function (res) {
        console.log('res', res)
        // 转发成功
        console.log("转发成功1:" + JSON.stringify(res));
        common.showErr('转发成功1')
        var shareTickets = res.shareTickets;
        if (shareTickets.length == 0) {
          return false;
        }
        //可以获取群组信息
        wx.getShareInfo({
          shareTicket: shareTickets[0],
          success: function (res) {
            console.log('可以获取群组信息', res)
          }
        })

      },
      fail: function (res) {
        // 转发失败
        console.log("转发失败:" + JSON.stringify(res));
        common.showErr('转发失败')

      }
    }
  },


})