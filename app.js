//app.js
import API from "/utils/api.js";
var Base64 = require('utils/base64.modified');
App({
  onLaunch: function () {
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    var that = this
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
    wx.getSystemInfo({
      success: function (res) {
        // console.log(res.model)
        // console.log(res.pixelRatio)
        // console.log(res.windowWidth)
        // console.log(res.screenHeight)
        // console.log(res.windowHeight)
        that.globalData.height = res.screenHeight
        // console.log(res.language)
        // console.log(res.system)
        // console.log(res.version)
        // console.log(res.platform)
      }
    })

  },
  getUser: function () {
    var that = this
    // 获取用户信息
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          console.log('用户授权过啦')
          wx.getUserInfo({
            success: res => {
              console.log(res)
              that.globalData.userInfo = res.userInfo;
              that.quanxian = 1;
              wx.request({
                url: that.globalData.ip + API.interface2,
                data: {
                  uId: that.globalData.uId,
                  nickName: Base64.encode(res.userInfo.nickName),
                  avatar: res.userInfo.avatarUrl,
                  gender: res.userInfo.gender,
                  userInfo: res.userInfo
                },
                method: "POST",
                success(res) {
                  console.log(res)
                },
                fail(e) {
                  console.log(e)
                }
              }),
                // 是否为vip 存储姓名
                wx.request({
                  url: that.globalData.ip + API.interface63,
                  data: {
                    uid: that.globalData.uId,
                  },
                  method: "POST",
                  success(res) {
                    if (res.data.code == 200) {
                      if (res.data.data.chaes == 'vip') {
                        that.vip = 1
                      }
                      that.username = res.data.data.username
                    }
                  },

                })
            },
            fail: function () {
              that.quanxian = 0;
              wx.showModal({
                title: '用户未授权',
                content: '如需正常使用小程序，请点击获取个人信息按钮授权。',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    console.log('用户点击确定')
                  }
                }
              })
            }
          })
        } else {
          wx.redirectTo({
            url: '../login/login',
          })
        }
      }
    })
  },
  login: function (ercode, callback) {
    var that = this
    console.log("二维码参数", ercode)
    wx.login({//获取code
      success: res => {
        console.log(res)
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        if (res.code) {
          //发起网络请求
          wx.request({
            url: that.globalData.ip + API.interface1,
            data: {
              code: res.code,
              ercode: ercode ? ercode : ""
            },
            method: "POST",
            success(res) {
              that.globalData.openid = res.data.openid;//openid变为全局变量
              that.globalData.uId = res.data.uid//uid变为全局变量
              that.globalData.token = res.data.token;
              that.globalData.userInfo = { avatarUrl: res.data.avatar, nickName: Base64.decode(res.data.nickname) }
              wx.hideToast();
              callback(null, res.data);
              console.log('信息', that.globalData);
              if (ercode) {
                let id = ercode;
                let uid = that.globalData.uId;
                console.log("扫码进入")
                console.log("生成二维码用户id", id);
                console.log("当前用户uid", uid);
                if (id == uid) {
                  wx.showModal({
                    title: '通知',
                    content: '推荐人不能为自己',
                    showCancel: false,
                    confirmColor: '#fa7c00'
                  })
                } else {
                  wx.request({
                    url: 'https://fawuding.cn/fwd/public/index.php/api/generalize/adduse',
                    data: { id, uid },
                    success: function (res) {
                      console.log("推荐人", res)
                      if (res.data.code == 0) {
                        if (res.data.msg == "该账户已有推荐人") {
                          wx.showModal({
                            title: '通知',
                            content: '该账户已有推荐人',
                            showCancel: false,
                            confirmColor: '#fa7c00'
                          })
                        } else if (res.data.msg == "该账户不能成为合伙人") {
                          wx.showModal({
                            title: '通知',
                            content: '该账户不能成为合伙人',
                            showCancel: false,
                            confirmColor: '#fa7c00'
                          })
                        }
                      }
                    }
                  })
                }
              }
            },
            fail(e) {
              callback(e);
            }
          })
        } else {
          console.log('获取用户登录态失败！' + res.errMsg)
        }
      }
    })
  },
  fetch(url, data, callback) {//post请求数据
    wx.request({
      url,
      data: data,
      method: "POST",
      success(res) {
        callback(null, res.data);
      },
      fail(e) {
        callback(e);
      }
    })
  },
  fetchGet(url, data, callback) {//post请求数据
    wx.request({
      url,
      data: data,
      success(res) {
        callback(null, res.data);
      },
      fail(e) {
        callback(e);
      }
    })
  },

  init: 0,
  news: 0,
  tnew: 0,
  vip: 0,
  username: '',
  globalData: {
    appid: 'wx801f30f6ce7c465f',
    secret: 'a33d3bd2ca26bcb4801b93f61ded3dcb',
    userInfo: null,
    openid: null,
    ip: "https://fawuding.cn/fwd/public",
    url: "https://fawuding.cn/fwd/public",
    money: 999,
    uId: '',
    session_key: ''
  },
  table: {
    reg: /^([a-zA-Z0-9\._-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/,
    ps: /^(13[0-9]|14[5-9]|15[012356789]|166|17[0-8]|18[0-9]|19[8-9])[0-9]{8}$/
  },
  //发送模板消息
  formSubmit: function () {

  },
  // 上传图片
  uploadimgs: function (data) {
    var index = data.formData.index
    var id = data.formData.id
    var that = this,
      i = data.i ? data.i : 0,
      success = data.success ? data.success : 0,
      fail = data.fail ? data.fail : 0;
    console.log(data.formData)
    console.log('data.path', i)
    console.log(data.path)
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      name: 'image',
      // formData: data.formData,
      formData: {
        id: id,
        num: i + 1,
      },
      success: function (res) {
        // data.path='';
        success++;
        console.log(res)
        console.log(i);
      },
      fail: function (res) {
        fail++;
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: function (res) {
        console.log(i);
        i++;
        if (i == data.path.length) {  //当图片传完时，停止调用       
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          // wx.navigateTo({
          //   url: '../renzheng/renzheng' 
          // })
        } else {
          console.log(i);
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimgs(data);
        }
      }
    })
  },
  // 上传图片
  uploadimg: function (data) {
    console.log("数据", data)
    var index = data.formData.index
    var id = data.formData.id
    var type = data.formData.type
    var that = this,
      i = data.i ? data.i : 0,
      success = data.success ? data.success : 0,
      fail = data.fail ? data.fail : 0;
    console.log(data.formData)
    console.log('data.path')
    console.log(data.path)
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      name: 'image',
      // formData: data.formData,
      formData: {
        id: id,
        type: type
      },
      success: function (res) {
        // data.path='';
        success++;
        console.log(res)
        console.log(i);
      },
      fail: function (res) {
        fail++;
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: function (res) {
        console.log(i);
        i++;
        if (i == data.path.length) {  //当图片传完时，停止调用       
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          that.fetch(that.globalData.ip + API.interface23, {
            oId: id,
            index: index,
            type: type
          }, (err, data) => {
            console.log('产生订单成功', data)
            if (data.code == 200) {
              wx.showToast({
                title: '创建成功',
              })
              setTimeout(function () {
                wx.redirectTo({
                  url: '../item/item?id=' + id + "&index=" + type
                })
              }, 1000);
            }
          })
        } else {
          console.log(i);
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }
      }
    })
  },
  creats: function getLocalTime(nS) {//時間戳轉換
    return new Date(parseInt(nS) * 1000).toLocaleString().replace(/:\d{1,2}$/, ' ');
  },
})