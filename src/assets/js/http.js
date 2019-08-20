// 封装fly请求以及添加拦截器
const Fly = require("./wx.js") //fly请求
const login = require("./login02.js") //登录相关函数
const config = require('./config.js') //引入配置文件
const fly_key = new Fly(); //创建fly实例,带key请求
const fly = new Fly(); //创建fly实例

let key = wx.getStorageSync("session_key")

//实例级配置
fly_key.config.timeout = 5000;

//定义公共headers
fly_key.config.headers = {
  "x-tag": "flyio"
}
//配置请求基地址
fly_key.config.baseURL = config.apiUrl
// 实例一个新的fly
var newFly = new Fly;



newFly.config = fly_key.config;

//添加请求拦截器
fly_key.interceptors.request.use(function (request) {
  //本次请求的超时时间
  request.timeout = 5000
  //打印出请求体
  // console.log(request.body)

  // 每次请求带上session_key
  request.body.key = key

  console.log(`1.发起请求：path:${request.url},baseURL:${request.baseURL},请求参数：`, request.body)

  if (request.body.key) { //检查本地缓存是否有session_key存在,没有则重新获取
    // request.headers = { //设置请求头
    //   "content-type": "application/json",
    //   "is_register": wx.getStorageSync('is_register')
    // }
  } else {
    console.log("2.session_key不存在，重新获取,锁住请求");
    fly_key.lock(); //锁住请求
    return login.getSKey().then((res) => {
      console.log('3.成功更新session_key:', res.data.data.s_key, "is_register", res.data.data.is_register);
      wx.setStorageSync("session_key", res.data.data.s_key); //缓存session_key
      wx.setStorageSync("is_register", res.data.data.is_register); //缓存is_register,是否新用户


      // 更新请求参数里的session_key
      key = res.data.data.s_key
      request.body.key = key

      console.log(`4.解锁请求,继续之前的请求：请求地址:${request.url},请求参数：`, request.body)

      // request.headers = { //设置请求头
      //   "content-type": "application/json",
      //   "is_register": wx.getStorageSync('is_register')
      // }

      return request; //继续之前的请求

    }).finally(() => {
      fly_key.unlock() //解锁后，会继续发起请求队列中的任务
    })
  }
})

// 添加响应拦截器//不要使用箭头函数，否则调用this.lock()时，this指向不对
fly_key.interceptors.response.use(function (response) {
    // console.log("response", response);
    console.log(`2.response,发起请求：请求地址:${response.request.url},请求参数：`, response.request.body)

    // 时间间隔， 防止多次重复请求登录态session_key
    let currentTime = new Date().getTime()
    let lastSendTime = wx.getStorageSync("lastSendTime") ? wx.getStorageSync("lastSendTime") : currentTime
    let intervalTime = currentTime - lastSendTime
    let timeout = 1000 //设置时间间距范围，超出该时间值则发起获取session_key请求
    console.log("currentTime", currentTime, "lastSendTime", lastSendTime, "intervalTime", intervalTime);

    //验证失效
    if (response.data.status === -1 && (intervalTime > timeout || intervalTime === 0)) {

      console.log("3.response,session_key失效，重新获取,锁住请求");

      this.lock(); //锁定响应拦截器，

      return login.getSKey().then(function (res) {
        console.log('4.response,成功更新session_key:', res.data.data.s_key, "is_register", res.data.data.is_register);
        wx.setStorageSync("session_key", res.data.data.s_key); //缓存session_key
        wx.setStorageSync("is_register", res.data.data.is_register); //缓存is_register,是否新用户
        let lastSendTime = new Date().getTime()
        wx.setStorageSync("lastSendTime", lastSendTime); //记录已经获得session_key的当前时间值

        // request.headers = { //设置请求头
        //   "content-type": "application/json",
        //   "is_register": wx.getStorageSync('is_register')
        // }

        // 更新请求参数里的session_key
        key = res.data.data.s_key
        response.request.body.key = key

      }).finally(() => {

        this.unlock() //解锁后，会继续发起请求队列中的任务

        // 清空时间间隔
        intervalTime = null

      }).then(() => {

        console.log(`5.response,解锁请求,继续之前的请求：请求地址:${response.request.url},请求参数：`, response.request.body)
        return fly_key.request(response.request); //继续之前的请求

      })
    } else if (response.data.status === -1 && (intervalTime < timeout)) {

      key = wx.getStorageSync("session_key") //再次获取最新的session_key
      response.request.body.key = key
      console.log(`5.response,已经更新了session_key，继续之前请求：请求地址:${response.request.url},请求参数：`, response.request.body)
      return fly_key.request(response.request); //继续之前的请求

    } else {
      console.log("3.response,返回response", response);
      return response;
    }
  },
  function (err) {
    console.log("响应拦截器,error-interceptor", err)
  }
)

module.exports = {
  fly_key: fly_key,
  fly: fly
}