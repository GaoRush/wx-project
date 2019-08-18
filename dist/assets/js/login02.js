'use strict';

var config = require('./config.js'); //引入配置文件
var url = config.apiUrl; //请求地址

// 获取session_key
function getSKey() {

  return new Promise(function (resolve, reject) {

    // 1.换取code
    wx.login({
      success: function success(res) {
        if (res.code) {
          //2.发送code，获取session_key
          wx.request({
            url: url + "login",
            data: {
              code: res.code
            },
            header: {
              'content-type': 'application/json' // 默认值
            },
            success: function success(res02) {
              resolve(res02);
            }
          });
        } else {
          // console.log('登录失败！' + res.errMsg)
          reject(res);
        }
      }
    });
  });
}

module.exports = {
  getSKey: getSKey
};