const config = require('./config.js') //引入配置文件
const url = config.postUrl //请求地址

// 获取session_key
function getSKey() {

  return new Promise((resolve, reject) => {

    // 1.换取code
    wx.login({
      success(res) {
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
            success(res02) {
              console.log("返回的res02", res02)
              resolve(res02)
            }
          })

        } else {
          // console.log('登录失败！' + res.errMsg)
        }
      }
    })

  });

}

module.exports = {
  getSKey: getSKey,
}