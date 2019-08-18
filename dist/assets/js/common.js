'use strict';

var config = require('./config.js'); //引入配置文件
var app = getApp();

// 浏览图片
function previewImage(e, imgList) {
  wx.hideLoading();
  var idx = e.currentTarget.dataset.idx;
  wx.previewImage({
    current: imgList[idx], // 当前显示图片的http链接
    urls: imgList // 需要预览的图片http链接列表
  });
}

/**
 * 提炼错误信息
 * @param {any} err 错误信息
 * @return {string} errMsg
 * err.errMsg 为小程序接口报错
 * err.data.msg 为后端接口报错
 */

function errPicker(err) {

  console.log('err', err);

  var msg = '网络出错，请重试！';
  var res = typeof err === 'string' ? err : err.msg || err.errMsg || err.detail && err.detail.errMsg || msg;
  // if (err instanceof Error) {
  //   console.error(err);
  // } else {
  //   console.error(res);
  // }
  return res;
}

/**
 * 错误弹窗
 */
function showErr(err) {
  var err_msg = errPicker(err);

  console.log('err_msg', err_msg);
  wx.hideLoading();
  wx.hideToast();

  wx.showModal({
    showCancel: false,
    content: err_msg
  });
}

// 提示窗
function alert(msg) {
  var icon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var mark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  wx.showToast({
    title: msg,
    icon: icon,
    mark: mark,
    duration: 1500
  });
}

// 加载提示窗
function show_loading() {
  var msg = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '加载中';
  var icon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var mark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  wx.showLoading({
    title: msg,
    icon: icon,
    mark: mark,
    duration: 1500
  });
}
// 关闭加载提示窗
function stop_loading() {
  var time = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;

  setTimeout(function () {
    wx.hideLoading();
  }, time);
}
// 延时返回
function alert_back(msg) {
  var icon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var mark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

  wx.showToast({
    title: msg,
    icon: icon,
    mark: mark,
    duration: 1500,
    success: function success() {
      setTimeout(function () {
        //要延时执行的代码
        wx.navigateBack();
      }, 1500); //延迟时间
    }
  });
}
// 延时跳转页面
function alert_url(msg) {
  var icon = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'none';
  var mark = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
  var url = arguments[3];

  wx.showToast({
    title: msg,
    icon: icon,
    mark: mark,
    duration: 1500,
    success: function success() {
      setTimeout(function () {
        //要延时执行的代码
        wx.navigateTo({
          url: url
        });
      }, 500); //延迟时间
    }
  });
}

// 确认弹窗
function showModal() {
  var tips = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '提示';
  var msg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '确定删除吗？';
  var confirm = arguments[2];
  var cancel = arguments[3];

  wx.showModal({
    title: tips,
    content: msg,
    success: function success(res) {
      if (res.confirm) {
        console.log('确定');
        confirm();
      } else if (res.cancel) {
        console.log('取消');
        cancel();
        return false;
      }
    }
  });
}

/*验证用户名*/
function checkUserName(user, errormsg) {
  console.log('正在检测,用户名只允许输入英文、数字、汉字', user);

  errormsg = errormsg || '用户名只允许输入英文、数字、汉字！';
  var reg = /^(\w|[\u4E00-\u9FA5])*$/;
  if (user.match(reg)) {
    return true;
  } else {
    console.log('errormsg', errormsg);
    alert(errormsg);
    return false;
  }
}

/*验证手机号码*/
function checkPhoneNumber(tel, errormsg) {
  console.log('正在检测,手机号码', tel);

  errormsg = errormsg || "请正确输入手机！";
  if (/^13\d{9}$/g.test(tel) || /^14\d{9}$/g.test(tel) || /^15\d{9}$/g.test(tel) || /^17\d{9}$/g.test(tel) || /^18\d{9}$/g.test(tel) || /^19\d{9}$/g.test(tel)) {
    return true;
  } else {
    alert(errormsg);
    return false;
  }
}

/*验证是否为空*/
function checkNullOrUndefined(content, errormsg) {
  errormsg = errormsg || "内容不能为空！";
  if (content == "" || content == " " || content == "  " || typeof content == "undefined") {
    alert(errormsg);
    return false;
  }
  return true;
}

// 金额检测
function isMoney(s, errormsg) {
  console.log('正在检测,金额', s);

  errormsg = errormsg || "请输入正确的金额!";
  var regu = /^\d+(\.\d{1,2})?$/;
  var re = new RegExp(regu);
  if (re.test(s)) {
    return true;
  } else {
    alert(errormsg);
    return false;
  }
}

// 搜索
function search(keyword) {}

/*验证是否为空*/
// function checkNullOrUndefined(content, errormsg) {
//     errormsg = errormsg || "内容不能为空！";
//     if (content == "" || content == " " || content == "  " || typeof (content) == "undefined") {
//         $.msg(errormsg);
//         return false;
//     }
//     return true;
// },

/**
 * 数字补全两位
 * @param {number} n
 */
function fix2(n) {
  return n > 9 ? n : '0' + n;
}

// 转成时间格式
function GetDateFormat(str) {
  if (str) {
    return new Date(parseInt(str.substr(6, 13))).toLocaleDateString();
  } else {
    return str = '';
  }
}

/**
 * 转成时间格式
 * @param {str} date(年月日)，time(包括时分秒)
 */
function date_time() {
  var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "date";
  var time = arguments[1];
  var unit = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "-";

  if (time) {
    if (type == "date") {
      var date = new Date(parseInt(time.substr(6, 13)));
      //月份为0-11，所以+1，月份小于10时补个0
      var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
      var currentDate = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
      var theTime = date.getFullYear() + unit + month + unit + currentDate;
      return theTime;
    } else if (type == "time") {
      var _date = new Date(parseInt(time.substr(6, 13)));
      //月份为0-11，所以+1，月份小于10时补个0
      var _month = _date.getMonth() + 1 < 10 ? "0" + (_date.getMonth() + 1) : _date.getMonth() + 1;
      var _currentDate = _date.getDate() < 10 ? "0" + _date.getDate() : _date.getDate();
      var hour = _date.getHours() < 10 ? "0" + _date.getHours() : _date.getHours();
      var minute = _date.getMinutes() < 10 ? "0" + _date.getMinutes() : _date.getMinutes();
      var second = _date.getSeconds() < 10 ? "0" + _date.getSeconds() : _date.getSeconds();
      var _theTime = _date.getFullYear() + unit + _month + unit + _currentDate + " " + hour + ":" + minute + ":" + second;
      return _theTime;
    }
  } else {
    return '';
  }
}

/**
 * 手机号码隐藏显示***
 * @param {num} 手机号码
 */
function hide_mobile(mobile) {
  if (mobile) {
    var xx = mobile.substr(3, 4);
    return mobile = mobile.replace(xx, '****');
  }
}

function getPage() {
  var num = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

  // 获取页面栈
  var pages = getCurrentPages();
  var currPage = pages[pages.length - num]; //当前页面
  var prevPage = pages[pages.length - (num + 1)]; //上一个页面

  // 当前页面
  // let current_page = pages[pages.length - num]

  // let current_page_src = current_page.route
  // let current_page_options = current_page.options

  var prevPage_data = {
    src: prevPage.route,
    options: prevPage.options
  };

  return prevPage_data;
  // console.log(pages);
  // console.log(current_page);
  // console.log(current_page);
  // console.log('current_page_src', current_page_src);
  // console.log('current_page_options', current_page_options);
  // let info = pages[pages.length - 2].data //取上页data里的数据也可以修改
}

module.exports = {
  previewImage: previewImage,
  showModal: showModal,
  alert: alert,
  alert_back: alert_back,
  alert_url: alert_url,
  checkUserName: checkUserName,
  checkPhoneNumber: checkPhoneNumber,
  checkNullOrUndefined: checkNullOrUndefined,
  fix2: fix2,
  showErr: showErr,
  show_loading: show_loading,
  stop_loading: stop_loading,
  search: search,
  GetDateFormat: GetDateFormat,
  isMoney: isMoney,
  date_time: date_time,
  hide_mobile: hide_mobile,
  getPage: getPage
};