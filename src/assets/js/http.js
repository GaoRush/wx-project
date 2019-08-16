// 封装fly请求以及添加拦截器
const Fly = require("./wx.js") //fly请求
const login = require("./login02.js") //登录相关函数
const config = require('./config.js') //引入配置文件
const fly = new Fly(); //创建fly实例


//实例级配置
fly.config.timeout = 5000;

//定义公共headers
fly.config.headers = {
  "x-tag": "flyio"
}
//配置请求基地址
fly.config.baseURL = config.url
// 实例一个新的fly
var newFly = new Fly;
newFly.config = fly.config;

//添加请求拦截器
fly.interceptors.request.use(function (request) {
  //本次请求的超时时间
  request.timeout = 5000

  console.log(`发起请求：path:${request.url}，baseURL:${request.baseURL}`)

  if (wx.getStorageSync("session_key")) { //检查本地缓存是否有session_key存在,没有则重新获取
    request.headers = { //设置请求头
      "content-type": "application/json",
      "is_register": wx.getStorageSync('is_register')
    }
    return request;
  } else {
    console.log("session_key不存在，重新获取,锁住请求");
    fly.lock(); //锁住请求
    return login.getSKey().then((res) => {
      console.log('成功更新session_key:', res.data.data.s_key, "is_register", res.data.data.is_register);
      wx.setStorageSync("session_key", res.data.data.s_key); //缓存session_key
      wx.setStorageSync("is_register", res.data.data.is_register); //缓存is_register,是否新用户


      console.log(`解锁请求,继续之前的请求：path:${request.url}，baseURL:${request.baseURL}`);
      request.headers = { //设置请求头
        "content-type": "application/json",
        "is_register": wx.getStorageSync('is_register')
      }
      fly.unlock(); //解锁请求
      return request; //继续之前的请求



    }).catch((err) => {

    });
  }
})

// 添加响应拦截器//不要使用箭头函数，否则调用this.lock()时，this指向不对
fly.interceptors.response.use(function (response) {
    console.log("interceptors.response", response)
    //验证失效
    if (response.data.status === -1) {
      console.log("session_key失效，重新获取,锁住请求");

      this.lock(); //锁定响应拦截器，
      return login.getSKey().then(function (res) {
        console.log('成功更新session_key:', res.data.data.s_key, "is_register", res.data.data.is_register);
        wx.setStorageSync("session_key", res.data.data.s_key); //缓存session_key
        wx.setStorageSync("is_register", res.data.data.is_register); //缓存is_register,是否新用户


        console.log(`解锁请求,继续之前的请求：path:${request.url}，baseURL:${request.baseURL}`);
        request.headers = { //设置请求头
          "content-type": "application/json",
          "is_register": wx.getStorageSync('is_register')
        }

        this.unlock(); //解锁请求
        return request; //继续之前的请求

      }).catch((err) => {

      });
    } else {
      return response.data.data;
    }
  },
  function (err) {
    log("error-interceptor", err)
  }
)

module.exports = {
  fly: fly
}