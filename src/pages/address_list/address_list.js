'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
const app = getApp()

// pages/test/test.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '地址管理',
    },
    url: config.url,
    imgUrl: config.imgUrl,
    chose_address: false,
    address_list: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this
    console.log('收货地址列表options', options)
    if (options.chose_address == 1) {
      that.setData({
        [`statusBar.title`]: '收货地址',
        chose_address: true
      })
      if (options.address_id) {
        that.setData({
          address_id: options.address_id
        })
        // 缓存当前选中的地址
        wx.setStorageSync('address_id', options.address_id)
      }
      // // 收货地址列表
      // that.get_address_list()
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function onShow() {
    let that = this
    let address_id = wx.getStorageSync('address_id')
    that.setData({
      page_index: 1,
      page_size: 8,
      address_list: [],
      isMore: true,
      address_id: address_id
    })
    that.get_address_list();
  },

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
  onPullDownRefresh: function () {
    console.log('下拉刷新')
    let that = this
    that.setData({
      page_index: 1,
      page_size: 8,
      address_list: [],
      isMore: true,
    })
    that.get_address_list();
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},

  // 收货地址列表
  get_address_list: function () {
    // 加载
    common.show_loading()

    let that = this
    login.requestP_pro({
      url: `${config.postUrl + "address_list"}`,
      data: {}
    }).then((res) => {
      console.log('res', res)
      // 停止加载
      common.stop_loading(500)

      // 加载更多:2 拼接新数据
      let old_list = that.data.address_list
      let res_list = res.list

      let address_list = res_list

      for (let i = 0; i < address_list.length; i++) {
        let area = address_list[i].area;
        // 去除所有标点符号
        let area_str = area.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g, "");
        address_list[i].address_full = area_str + address_list[i].address
        console.log('area', area, typeof (area))

        // 手机号码加密处理
        let mobile = address_list[i].mobile
        address_list[i].mobile = common.hide_mobile(mobile)
      }

      let new_list = old_list.concat(res_list)

      // // let area = address_list.area.join("");
      console.log('address_list', address_list)

      // 加载更多:3 赋值
      that.setData({
        address_list: new_list,
        page_index: res.page_index,
        page_size: res.page_size,
        total_count: res.total_count,
        isMore: true
      })

      if (that.data.chose_address) {
        let address_list = that.data.address_list

        // 如果带有地址id，则选中该地址
        if (that.data.address_id) {
          // 遍历找出相同的地址id，选中
          for (let i in address_list) {
            let item = address_list[i]

            if (Number(that.data.address_id) == Number(item.id)) {
              item.selected = true;
            }
          };
        } else if (address_list.length > 0) {
          // 如果没有则默认选中第一个地址
          address_list[0].selected = true
        }
        that.setData({
          address_list: address_list
        })
      }


      console.log('address_list', that.data.address_list)
    }).catch((err) => {
      common.showErr(err)
    });
  },
  // 选择地址
  chose_address: function (e) {
    console.log('e', e)
    let that = this
    if (that.data.chose_address) {
      let index = e.currentTarget.dataset.idx
      let address_list = that.data.address_list
      for (let i = 0; i < address_list.length; i++) {
        address_list[i].selected = false;
      }
      address_list[index].selected = true
      that.setData({
        address_list: address_list
      })
      let address_selected = {
        id: address_list[index].id,
        accept_name: address_list[index].accept_name,
        address: address_list[index].address_full,
        mobile: address_list[index].mobile,
        is_default: address_list[index].is_default,
      }
      wx.setStorageSync('address_selected', address_selected)
      console.log("address_selected", address_selected)

      wx.navigateBack({
        delta: 1
      });
      // wx.redirectTo({
      //   url: `${'../../pages/order_submit/order_submit'}`
      // })

    } else {
      return false
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
        that.get_address_list()
      }
    }

  }
})