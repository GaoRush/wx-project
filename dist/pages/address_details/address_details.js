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
      title: '地址管理'
    },
    url: config.url,
    imgUrl: config.imgUrl,
    addressId: 0,
    address: {
      id: 0,
      accept_name: '',
      mobile: '',
      area: ['请选择', '请选择', '请选择'],
      address: '',
      is_default: 1
    },
    // 是否新增地址
    address_add: true,
    // 删除按钮是否禁用
    btn_del_disabled: true,
    // 保存按钮是否禁用
    btn_sumbit_disabled: false,
    // 是否选择地址
    chose_address: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;
    // 新增或修改收货地址
    // that.address_edit()

    console.log('options', options);
    if (options.addressId) {
      that.setData({
        addressId: options.addressId,
        address_add: false,
        btn_del_disabled: false
      });
      // 获取收货地址详情
      that.address_details();
    }

    if (options.chose_address == 1) {
      that.setData({
        chose_address: true
      });
    }

    // if (options.address_list == 1) {
    //   that.setData({
    //     btn_del_disabled: true
    //   })
    // }

    // 解决ios里的textarea出现内边距的bug
    var system = wx.getSystemInfoSync();
    if (system.platform == 'ios') {
      that.setData({
        hackIos: '-12rpx'
      });
    }
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function onShareAppMessage() {},
  // 昵称
  bindInput: function bindInput(e) {
    console.log('e', e);

    var that = this;
    var name = e.currentTarget.dataset.name;
    // let address = that.data.address
    if (name == 'accept_name') {
      console.log('名字输入', name);
      that.setData(_defineProperty({}, 'address.accept_name', e.detail.value));
      var warn = common.checkUserName(that.data.address.accept_name);
    }

    if (name == 'mobile') {
      console.log('手机号码输入', name);
      that.setData(_defineProperty({}, 'address.mobile', e.detail.value));
      var _warn = common.checkPhoneNumber(that.data.address.mobile);
    }

    if (name == 'address') {
      console.log('详情地址输入', name);
      that.setData(_defineProperty({}, 'address.address', e.detail.value));
      console.log('btn_disabled');
    }
  },

  // 地址选择
  bindRegionChange: function bindRegionChange(e) {
    var that = this;
    var area = e.detail.value;
    console.log('area', area);
    that.setData(_defineProperty({}, 'address.area', area));
    console.log('that', that.data);
  },
  // 是否默认
  is_default: function is_default(e) {
    var that = this;
    console.log('is_default发生change事件，携带value值为：', e.detail.value);
    var address = that.data.address;
    var is_default = e.detail.value ? 1 : 0;
    that.setData(_defineProperty({}, 'address.is_default', is_default));
    console.log('that.data', that.data);
  },


  // 检查是否为空
  checkNone: function checkNone(obj) {
    console.log('检测中', obj);
    var that = this;
    console.log('检测中');
    var address = obj;
    if (address.accept_name != '' && address.mobile != '' && address.address != '' && address.area[0] != '请选择') {
      console.log('检测通过');
      return true;
    } else {
      console.log('检测未通过');
      common.alert('请填写完整信息！');
      return false;
    }
  },

  // 新增或修改收货地址
  address_edit: function address_edit(e) {
    var that = this;
    var address = that.data.address;
    console.log('address', address);
    console.log('e', e);
    // 检查是否为空
    if (that.checkNone(address)) {
      var area = that.data.address.area.join(',');
      var data = {
        id: address.id,
        accept_name: address.accept_name,
        mobile: address.mobile,
        area: area,
        address: address.address,
        is_default: address.is_default
      };
      console.log('address-data', data);
      login.requestP_pro({
        url: '' + (config.postUrl + 'address_edit'),
        data: data
      }).then(function (res) {
        console.log('res', res);

        // 延迟返回页面
        // common.alert_back(res.msg)
        common.alert(res.msg);

        // 确认保存并使用
        // if (that.data.chose_address) {
        //   // 去除所有标点符号
        //   let area_str = area.replace(/[\ |\~|\`|\!|\@|\#|\$|\%|\^|\&|\*|\-|\_|\+|\=|\||\\|\[|\]|\{|\}|\;|\:|\"|\'|\,|\<|\.|\>|\/|\?]/g, "");
        //   let address_full = area_str + address.address

        //   let address_selected = {
        //     id: address.id,
        //     accept_name: address.accept_name,
        //     address: address_full,
        //     mobile: address.mobile,
        //     is_default: address.is_default,
        //   }
        //   wx.setStorageSync('address_selected', address_selected)
        //   console.log("address_selected", address_selected)
        //   wx.redirectTo({
        //     url: `${'../../pages/order_submit/order_submit'}`
        //   })

        // } else {
        //   wx.redirectTo({
        //     url: `${'../../pages/address_list/address_list'}`,
        //   })
        // }

        // 确认保存返回收货列表
        if (that.data.chose_address) {
          wx.redirectTo({
            url: '../../pages/address_list/address_list?chose_address=1'
          });
        } else {
          // 返回地址列表
          wx.redirectTo({
            url: '../../pages/address_list/address_list'
          });
        }
      }).catch(function (err) {
        common.showErr(err);
      });
    }
  },

  // 获取收货地址详情
  address_details: function address_details(e) {
    var that = this;
    login.requestP_pro({
      url: '' + (config.postUrl + 'address_details'),
      data: {
        id: that.data.addressId
      }
    }).then(function (res) {
      console.log('获取收货地址详情res', res);
      var area = res.data.area.split(",");
      that.setData(_defineProperty({
        address: res.data
      }, 'address.area', area));
      console.log('that.data', that.data);
      // that.checkNone()
    }).catch(function (err) {
      common.showErr(err);
    });
  },

  // 删除地址提示
  bind_address_del: function bind_address_del() {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: function success(res) {
        if (res.confirm) {
          // 删除地址
          that.address_del();
        } else if (res.cancel) {
          return false;
        }
      }
    });
  },

  // 删除地址
  address_del: function address_del() {
    var that = this;
    var address_add = that.data.address_add;
    // 非新增地址的情况下才能删除
    if (!address_add) {
      // 删除按钮可用
      that.setData({
        btn_del_disabled: false
      });
      var addressId = that.data.addressId;
      login.requestP_pro({
        url: '' + (config.postUrl + 'address_remove'),
        data: {
          id: addressId
        }
      }).then(function (res) {
        console.log('that.data', that.data);

        // 清除选择前的地址
        wx.setStorageSync('address_selected', '');
        wx.setStorageSync('address_id', '');

        if (that.data.chose_address) {
          // 延迟返回页面
          common.alert(res.msg);
          wx.redirectTo({
            url: '../../pages/address_list/address_list?chose_address=1'
          });
        } else {
          // 延迟返回页面
          common.alert(res.msg);
          wx.redirectTo({
            url: '../../pages/address_list/address_list'
          });
        }
      }).catch(function (err) {
        common.showErr(err);
      });
    }
  },
  // 正在输入
  input: function input() {
    console.log("正在输入");
    var that = this;
    that.setData({
      btn_sumbit_disabled: true
    });
  }
});