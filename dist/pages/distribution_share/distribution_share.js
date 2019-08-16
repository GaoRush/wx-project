'use strict';

var _rpx2px = require('../../utils/rpx2px.js');

var _rpx2px2 = _interopRequireDefault(_rpx2px);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var config = require('../../assets/js/config.js');
var common = require('../../assets/js/common.js');
var login = require('../../assets/js/login.js');
var app = getApp();

var QRCode = require('../../utils/weapp-qrcode.js');

var qrcode = void 0;

// 300rpx 在6s上为 150px
var qrcodeWidth = (0, _rpx2px2.default)(300);

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 自定义导航
    statusBar: {
      title: '分销中心'
    },
    url: config.url,
    imgUrl: config.imgUrl,

    source_user_token: '9851118',
    prurl: 'http://tmp/wxe4a802a5abd47ce7.o6zAJs0feLrAY4JEElQr-_tPJ7_c.9iMoWlE4yeJ6685f3452720d90ecab390ae597d825bf.png',
    hidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    var that = this;

    console.log('options', options);
    if (options.scene) {
      console.log("has scene");
      // options 中的scene需要使用decodeURIComponent才能获取到生成二维码时传入的scene
      var scene = decodeURIComponent(options.scene); //参数二维码传递过来的参数
      var query = options.query.dentistId; // 参数二维码传递过来的场景参数
      console.log("scene is ", scene);

      // var arrPara = scene.split("&");
      // var arr = [];
      // for (var i in arrPara) {
      //   arr = arrPara[i].split("=");
      //   wx.setStorageSync(arr[0], arr[1]);
      //   console.log("setStorageSync:", arr[0], "=", arr[1]);
      // }
    } else {
      console.log("no scene");
    }

    // 分享推广
    // 此处获取设备的宽高。canvas绘制的图片以次宽高为准
    wx.getSystemInfo({
      success: function success(res) {
        console.log(res);
        that.setData({
          windowW: res.windowWidth,
          // 设计稿宽高为 750 * 1240
          windowH: 1240 / 750 * res.windowWidth,
          pixelRatio: res.pixelRatio
        });
      }
    });

    var promise1 = new Promise(function (resolve, reject) {

      /* 获得要在画布上绘制的二维码背景 */
      wx.getImageInfo({
        src: '../../assets/images/share_bg.jpg',
        success: function success(res) {
          console.log('获取二维码背景', res);
          resolve(res);
        }
      });
    });

    var promise2 = new Promise(function (resolve, reject) {

      that.get_qrcode().then(function (res01) {
        // console.log('res', res)
        if (res01.data.qrcode) {
          // let res_qrcode = res01.data.qrcode.substr(1)
          var res_qrcode = res01.data.qrcode;
          var _qrcode = config.url + res_qrcode;
          console.log('qrcode', _qrcode);

          wx.downloadFile({
            url: _qrcode, // 仅为示例，并非真实的资源
            success: function success(res02) {
              console.log("downloadFile", res02);
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              resolve(res02.tempFilePath);

              // if (res02.statusCode === 200) {
              //   /* 获得要在画布上绘制的二维码 */
              //   wx.getImageInfo({
              //     src: res02.tempFilePath,
              //     success: function (res03) {
              //       console.log('获取二维码', res03)
              //       resolve(res03);
              //     }
              //   })
              // }
            }
          });
        }
      }).catch(function (err) {
        reject(err);
      });
    });

    /* 图片获取成功才执行后续代码 */
    Promise.all([promise1, promise2]).then(function (res) {
      console.log('图片获取成功才执行后续代码', res);

      /* 创建 canvas 画布 */
      var ctx = wx.createCanvasContext('shareImg');

      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      ctx.drawImage('../../' + res[0].path, 0, 0, that.data.windowW, that.data.windowH);
      ctx.drawImage(res[1], that.data.windowW / 2 - 75, that.data.windowH / 2, 150, 150);

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('center'); //  位置
      ctx.setFillStyle('#ffffff'); //  颜色

      /* 绘制 */
      ctx.stroke();
      ctx.draw();

      // ctx.save() //这句很重要  保存之前的绘制
      // let r = 105
      // let cx = 158 + r
      // let cy = 190 + r
      // ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      // ctx.clip()
      // ctx.drawImage('../../' + res[0].path, 158, 190, 210, 210)
      // ctx.restore()
      // ctx.draw()
    });
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
   * 生命周期函数--监听页面隐0.
   * 藏
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

  share: function share() {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.windowW,
      height: that.data.windowH,
      destWidth: that.data.windowW * that.data.pixelRatio,
      destHeight: that.data.windowH * that.data.pixelRatio,
      canvasId: 'shareImg',
      success: function success(res) {
        console.log(res.tempFilePath);
        /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
        that.setData({
          prurl: res.tempFilePath,
          hidden: false
        });
      },
      fail: function fail(res) {
        console.log(res);
      }
    });
  },
  save: function save() {
    var that = this;
    wx.saveImageToPhotosAlbum({
      filePath: that.data.prurl,
      success: function success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧晒一下吧~',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function success(res) {
            if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              that.setData({
                hidden: true
              });
            }
          }
        });
      }
    });
  },
  // 获取二维码
  get_qrcode: function get_qrcode() {
    var _this = this;

    return new Promise(function (resolve, reject) {
      var that = _this;
      var urlData = {
        is_refresh: 1
      };
      login.requestP_pro({
        url: '' + (config.postUrl + 'get_qrcode'),
        data: urlData
      }).then(function (res) {
        // console.log('res', res)
        resolve(res);
      }).catch(function (err) {
        common.alert(err);
      });
    });
  }
});