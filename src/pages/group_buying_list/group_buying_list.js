'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
const app = getApp()
let setTime_list
// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: ''
    },
    url: config.url,
    imgUrl: config.imgUrl,
    statusBar_height: 0,
    goods_list: [],
    cid: 0,
    keyword: '',
    page_index: 1,
    page_size: 8,
    time: '',
    total_count: 0,
    isMore: true,
    isFirst: true,
    current_time: "",
    is_countDown: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this
    console.log('options', options)
    if (options.cid) {
      // 有分类id
      that.setData({
        cid: Number(options.cid),
        [`statusBar.title`]: options.title
      })
    }

    if (options.keyword) {
      // 有搜索关键词
      that.setData({
        keyword: options.keyword,
        inputVaue: options.keyword
      })
    }

    // 获取自定义导航的整体高度
    that.setData({
      statusBar_height: that.selectComponent('#statusBar')
    })

    // 获取产品列表
    that.get_goods_list()
    // 获取系统信息
    wx.getSystemInfo({
      success: function (res) {
        // 可使用窗口宽度、高度
        // console.log('height=' + res.windowHeight)
        // console.log('width=' + res.windowWidth)
        // console.log('状态栏高度=' + res.statusBarHeight)
        // console.log('搜索栏高度=', '45px')

        // 计算主体部分高度,单位为px
        that.setData({
          // 滚动区域高度 = 利用窗口可使用高度 - 自定义导航头部高度-搜索栏高度
          scroll_main: res.windowHeight - that.data.statusBar_height - 45
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    if (this.data.is_countDown == false) {
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
    clearTimeout(setTime_list)
    this.setData({
      is_countDown: false
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function onUnload() {
    console.log('onUnload清除定时器')
    // common.alert('清除定时器')
    clearTimeout(setTime_list)
    this.setData({
      is_countDown: false
    })
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function onPullDownRefresh() {
    console.log('下拉刷新')
    let that = this
    that.setData({
      page_index: 1,
      page_size: 8,
      goods_list: [],
      isMore: true,
    })
    that.get_goods_list();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {
    console.log('上拉了')
    let that = this
    // setTimeout模拟加载时间
    setTimeout(function () {}, 500)
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 获取产品列表
  get_goods_list: function () {
    // 加载
    common.show_loading()

    let that = this
    console.log('that.data', that.data)
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

        console.log('goods_list', res)
        // 停止加载
        common.stop_loading(500)
        let old_list = that.data.goods_list
        let res_list = res.list
        let new_list = old_list.concat(res_list)

        // 加载更多:3 赋值
        that.setData({
          goods_list: new_list,
          page_index: res.page_index,
          page_size: res.page_size,
          total_count: res.total_count,
          isMore: true,
          current_time: res.current_time
        })

        // console.log('goods_list', res)
        // 有团购才执行倒计时
        if (that.data.goods_list.length > 0) {
          // 获取倒计时时间
          that.get_time_list()
        }

      })
      .catch(err => {
        console.log('goods_list_err', err)
        common.showErr(err)
      })
  },

  // 搜索
  inputSearch: function (e) {
    console.log('提交表单', e)
    // 获取用户输入框中的值
    let inputVaue = e.detail.value['search-input'] ? e.detail.value['search-input'] : e.detail.value;
    if (!inputVaue) {
      common.alert('请输入搜索关键词')
      return;
    }
    let searchUrl = "../../pages/group_buying_list/group_buying_list?keyword=" + inputVaue;
    // let searchUrl = "/product/index?keyword=" + inputVaue + "&fromindex=true";
    // this.converterUrlAndRedirect(searchUrl);

    // 跳转搜索页面
    wx.navigateTo({
      url: searchUrl
    })
  },

  // 添加购物车
  bindAddCart: function (e) {
    console.log('e', e)
    let that = this
    let goods_list = that.data.goods_list
    let prdindex = e.currentTarget.dataset.prdindex
    let goods_obj = {
      title: goods_list[prdindex].title,
      id: goods_list[prdindex].id,
      img_url: goods_list[prdindex].img_url,
      sell_price: goods_list[prdindex].sell_price,
    }

    console.log('goods_obj', goods_obj)

    // 获取添加购物车插件
    let addCart = that.selectComponent('#addCart')
    addCart.addCart(goods_obj)
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
            current_time: parseInt(res.current_time.substr(6, 13))
          })
          // console.log('current_time', that.data.current_time)
          resolve(that.data.current_time)
        })
        .catch(err => {
          common.showErr(err)
        })

    })
  },
  // 团购：获取倒计时的开始结束时间
  get_time_list: function () {
    let that = this
    // 将活动的结束时间参数提成一个单独的数组，方便操作
    let startTimeList = []
    let endTimeList = []
    let goods_list = that.data.goods_list
    let newTime = new Date().getTime();
    let currentTime = parseInt(that.data.current_time.substr(6, 13))
    // console.log('newTime', newTime)
    // console.log('currentTime', currentTime)
    // console.log('goods_list22', goods_list)
    goods_list.forEach(o => {
      // console.log('o.start_time', o.start_time)
      startTimeList.push(parseInt(o.start_time.substr(6, 13)))
      endTimeList.push(parseInt(o.end_time.substr(6, 13)))
    })
    // console.log('endTimeList', endTimeList, 'startTimeList', startTimeList)
    that.setData({
      endTimeList: endTimeList,
      startTimeList: startTimeList,
      currentTime: currentTime,
    })
    that.countDown()
  },
  timeFormat(param) { //小于10的格式化函数
    return param < 10 ? '0' + param : param;
  },
  // 团购：倒计时
  countDown() { //倒计时函数
    // 获取当前时间，同时得到活动结束时间数组
    if (this.data.is_countDown) {
      this.get_current_time().then((res) => {
        let newTime = res;
        let endTimeList = this.data.endTimeList;
        let countDownArr = [];
        // console.log('endTimeList', endTimeList, 'newTime', newTime)

        // 对结束时间进行处理渲染到页面
        endTimeList.forEach(o => {
          let endTime = new Date(o).getTime();
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

        })
        // 渲染，然后每隔一秒执行一次倒计时函数
        setTime_list = setTimeout(this.countDown, 1000);

        // console.log('countDownList', this.data.countDownList)
      }).catch((err) => {
        common.showErr(err)

      });
    }
  },
  // 加载更多 4：加载更多
  loadMore: function () {
    let that = this
    let page_index = that.data.page_index;
    let page_size = that.data.page_size;
    let total_count = that.data.total_count
    let max_page_index = Math.ceil(total_count / page_size)
    if (total_count > 0) {
      page_index++
      if (page_index > max_page_index) {
        that.setData({
          page_index: page_index - 1,
          isMore: false
        })
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index)
        console.log("无法加载更多")
        common.alert('没有更多了')
        return false
      } else {
        that.setData({
          page_index: page_index,
          isMore: true
        })
        console.log("当前页码:" + page_index, "最大页码:" + max_page_index)
        console.log("加载更多")
        // 获取列表
        that.get_goods_list()
      }
    }
  }
})