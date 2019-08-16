'use strict'
const config = require('../../assets/js/config.js')
const common = require('../../assets/js/common.js')
const login = require('../../assets/js/login.js')
const app = getApp()

const WxParse = require('../../assets/wxParse/wxParse.js');

// pages/test/test.js
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
    amount: 0,
    btn_disabled: true,
    show_pop: false,
    // 分享推广
    source_user_token: '',
    hidden: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function onLoad(options) {
    let that = this

    console.log('options', options)

    // 分销中心
    that.distribution_core()

    // 获取自定义导航的整体高度
    that.setData({
      statusBar_height: that.selectComponent('#statusBar')
    })

    // 分享推广
    // 此处获取设备的宽高。canvas绘制的图片以次宽高为准
    wx.getSystemInfo({
      success: function (res) {
        console.log(res)
        that.setData({
          windowW: res.windowWidth,
          // 设计稿宽高为 750 * 1240
          windowH: 1240 / 750 * res.windowWidth,
          pixelRatio: res.pixelRatio
        })
      },
    })

    let promise1 = new Promise(function (resolve, reject) {

      /* 获得要在画布上绘制的二维码背景 */
      wx.getImageInfo({
        src: '../../assets/images/share_bg.jpg',
        success: function (res) {
          console.log('获取二维码背景', res)
          resolve(res);
        }
      })
    });

    let promise2 = new Promise(function (resolve, reject) {

      that.get_qrcode().then((res01) => {
        // console.log('res', res)
        if (res01.data.qrcode) {
          // let res_qrcode = res01.data.qrcode.substr(1)
          let res_qrcode = res01.data.qrcode
          let qrcode = config.url + res_qrcode
          console.log('qrcode', qrcode)

          wx.downloadFile({
            url: qrcode, // 仅为示例，并非真实的资源
            success(res02) {
              console.log("downloadFile", res02)
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
          })

        }
      }).catch((err) => {
        reject(err)
      });
    });

    /* 图片获取成功才执行后续代码 */
    Promise.all(
      [promise1, promise2]
    ).then(res => {
      console.log('图片获取成功才执行后续代码', res)

      /* 创建 canvas 画布 */
      const ctx = wx.createCanvasContext('shareImg')

      /* 绘制图像到画布  图片的位置你自己计算好就行 参数的含义看文档 */
      /* ps: 网络图片的话 就不用加../../路径了 反正我这里路径得加 */
      ctx.drawImage('../../' + res[0].path, 0, 0, that.data.windowW, that.data.windowH)
      ctx.drawImage(res[1], that.data.windowW / 2 - 75, that.data.windowH / 2, 150, 150)

      /* 绘制文字 位置自己计算 参数自己看文档 */
      ctx.setTextAlign('center') //  位置
      ctx.setFillStyle('#ffffff') //  颜色

      /* 绘制 */
      ctx.stroke()
      ctx.draw()


      // ctx.save() //这句很重要  保存之前的绘制
      // let r = 105
      // let cx = 158 + r
      // let cy = 190 + r
      // ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      // ctx.clip()
      // ctx.drawImage('../../' + res[0].path, 158, 190, 210, 210)
      // ctx.restore()
      // ctx.draw()
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
      amount: 0,
      amount_total: 0,
      team_count: 0,
    })
    that.distribution_core()
    wx.stopPullDownRefresh()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function onReachBottom() {

  },
  // 分销中心
  distribution_core: function () {
    let that = this
    login.requestP_pro({
      url: `${config.postUrl+'distribution_core'}`,
      data: {}
    }).then((res) => {
      console.log('res', res)
      if (res.data) {
        that.setData({
          amount: res.data.amount,
          amount_total: res.data.amount_total,
          team_count: res.data.team_count,
        })
      }
    }).catch((err) => {
      common.showErr(err)
    });
  },

  // 输入金额
  bindInput_money: function (e) {
    console.log('e', e)

    let that = this
    let name = e.currentTarget.dataset.name
    let amount = that.data.amount

    if (name == 'use_money') {
      console.log('输入金额', name)

      let input_money = e.detail.value
      let btn_disabled = that.data.btn_disabled
      // if (!common.isMoney(input_money)) {
      //   // 正则检测是否正确金额，否取最大值金额
      //   wx.hideToast()
      //   common.alert('请输入正确的金额！')
      //   input_money = 0
      //   btn_disabled = true
      //   that.setData({
      //     input_money: input_money,
      //     btn_disabled: btn_disabled
      //   })
      //   return false
      // } else if (input_money > amount) {
      //   // 检测是否超过可用金额范围！超过则取最大值金额
      //   wx.hideToast()
      //   common.alert('输入金额已超过可取现金额的范围！')
      //   input_money = amount
      //   btn_disabled = true
      //   that.setData({
      //     input_money: input_money,
      //     btn_disabled: btn_disabled
      //   })
      //   return false
      // } else if (input_money < 100) {
      //   // 检测最低100提现
      //   wx.hideToast()
      //   common.alert('输入金额需满100才可提现!')
      //   input_money = 0
      //   btn_disabled = true
      //   that.setData({
      //     input_money: input_money,
      //     btn_disabled: btn_disabled
      //   })
      //   return false
      // } else {
      //   btn_disabled = false
      //   that.setData({
      //     input_money: input_money,
      //     btn_disabled: btn_disabled
      //   })
      // }

      that.setData({
        input_money: input_money,
        btn_disabled: false
      })

      console.log('amount', that.data)
    }
  },
  // 提现申请
  cash_withdrawal: function () {
    console.log('提现申请cash_withdrawal')
    let that = this
    login.requestP_pro({
      url: `${config.postUrl+'cash_withdrawal'}`,
      data: {}
    }).then((res) => {
      console.log('res', res)
      that.setData({
        amount: res.data.amount
      })
      // 提现弹窗
      that.show_pop()

    }).catch((err) => {
      common.showErr(err)
    });

  },
  // 提现申请提交
  cash_withdrawal_submit: function () {
    console.log('提现申请提交cash_withdrawal_submit')

    let that = this
    let amount = that.data.input_money
    // let btn_disabled = that.data.btn_disabled
    // common.isMoney(amount) ? btn_disabled = false : btn_disabled = true

    // that.setData({
    //   btn_disabled: btn_disabled
    // })


    // 检查输入金额
    that.check_cash(amount)

    if (that.data.btn_disabled == false) {
      console.log('amount', amount, typeof (amount))

      wx.showModal({
        title: '提示',
        content: `${'确认提现金额：'+ amount + ' 元 吗'}`,
        success(res) {
          if (res.confirm) {
            login.requestP_pro({
              url: `${config.postUrl+'cash_withdrawal_submit'}`,
              data: {
                amount: amount
              }
            }).then((res) => {
              console.log('res', res)
              common.alert(res.msg)
              // 重新加载分销中心
              that.distribution_core()
              setTimeout(() => {
                // 关闭提现弹窗
                that.show_pop()
              }, 500);

            }).catch((err) => {
              common.showErr(err)
            });
          } else if (res.cancel) {
            return false
          }
        }
      })
    } else {
      return false
    }

  },
  // 提现弹窗
  show_pop: function () {
    console.log('提现弹窗show_pop')

    let that = this
    let show_pop = that.data.show_pop
    show_pop = !show_pop
    that.setData({
      input_money: 0,
      show_pop: show_pop
    })
  },
  // 检查输入金额
  check_cash: function (input_money) {
    let that = this
    // let input_money = that.data.input_money
    let btn_disabled = that.data.btn_disabled
    let amount = that.data.amount
    if (!common.isMoney(input_money)) {
      // 正则检测是否正确金额，否取最大值金额
      wx.hideToast()
      common.alert('请输入正确的金额！(最多两位小数)')
      input_money = 0
      btn_disabled = true
      that.setData({
        input_money: input_money,
        btn_disabled: btn_disabled
      })
      return false
    } else if (input_money > amount) {
      // 检测是否超过可用金额范围！超过则取最大值金额
      wx.hideToast()
      common.alert('输入金额已超过可取现金额的范围！')
      input_money = amount
      btn_disabled = true
      that.setData({
        input_money: input_money,
        btn_disabled: btn_disabled
      })
      return false
    } else if (input_money < 100) {
      // 检测最低100提现
      wx.hideToast()
      common.alert('输入金额需满100才可提现!')
      input_money = 0
      btn_disabled = true
      that.setData({
        input_money: input_money,
        btn_disabled: btn_disabled
      })
      return false
    } else {
      btn_disabled = false
      that.setData({
        input_money: input_money,
        btn_disabled: btn_disabled
      })
    }
  },
  share: function () {
    // 加载
    common.show_loading()

    let that = this
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      width: that.data.windowW,
      height: that.data.windowH,
      destWidth: that.data.windowW * that.data.pixelRatio,
      destHeight: that.data.windowH * that.data.pixelRatio,
      canvasId: 'shareImg',
      success: function (res) {
        console.log(res.tempFilePath);
        // 停止加载
        common.stop_loading(0)

        /* 这里 就可以显示之前写的 预览区域了 把生成的图片url给image的src */
        that.setData({
          prurl: res.tempFilePath,
          hidden: false
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  save: function () {
    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.prurl,
      success(res) {
        wx.showModal({
          content: '图片已保存到相册，赶紧推广一下吧',
          showCancel: false,
          confirmText: '好的',
          confirmColor: '#333',
          success: function (res) {
            if (res.confirm) {
              console.log('用户点击确定');
              /* 该隐藏的隐藏 */
              that.setData({
                hidden: true
              })
            }
          }
        })
      }
    })

  },
  // 获取二维码
  get_qrcode: function () {
    return new Promise((resolve, reject) => {
      let that = this
      let urlData = {
        is_refresh: 0,
      }
      login
        .requestP_pro({
          url: `${config.postUrl + 'get_qrcode'}`,
          data: urlData
        })
        .then(res => {
          // console.log('res', res)
          resolve(res)
        })
        .catch(err => {
          common.alert(err)
        })
    })
  },
  /**
   * 用户点击右上角分享
   */
  // 转赠流程： 2 
  /* 转发*/
  onShareAppMessage: function (ops) {
    let that = this
    // console.log('ops', ops)
    // let source_coupon_no = ops.target.dataset.coupon
    // let source_user_token = ops.target.dataset.usertoken

    if (ops.from === 'button') {
      // 来自页面内转发按钮
      console.log(ops.target)
      // common.showErr('转发成功')

    }
    return {
      title: '快来加入我的团队!',
      imageUrl: that.data.prurl,
      path: 'pages/index/index',
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
  // 长按识别
  previewImage: function (e) {
    let current = e.target.dataset.src;
    wx.previewImage({
      current: current,
      urls: [current]
    })
  },
  // 关闭分享图片
  preview_close: function () {
    let that = this
    that.setData({
      hidden: true
    })
  },

})