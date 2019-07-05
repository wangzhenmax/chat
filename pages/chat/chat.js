// pages/test/test.js
const app = getApp();
import API from "../../utils/api.js";
const em_img = "https://www.fawuding.cn/fwd/public/assets/newimg/chat_em.png"
const file_img = "https://www.fawuding.cn/fwd/public/assets/newimg/chat_open.png"
const de_bottomH = 100;
const wssUrl = "wss://ws.nearbyfree.cn/"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    messArr: [],
    em: ['😕', '😛', '😎', '😅', '😬', '😵', '😡',
      '😊', '😅', '😲', '😭', '😂', '😄', '😩',
      '😞', '😵', '😒', '😍', '😤', '😜', '😝',
      '😋', '😘', '😚', '😷', '😳', '😃', '😆',
      '😁', '😢', '😨', '😠', '😣', '😌', '😖',
      '😔', '😰', '😱', '😪', '😏', '😓'
    ],
    toView: '',
    bool: true,
    open_em_url: em_img,
    open_file_url: file_img,
    height: "0rpx", // 初始化
    bottom: "0rpx",
    emHeight: "0rpx",
    is_em: true,
    is_file: true,
    bottomH: de_bottomH + "rpx",
    val: '',
    is_show_add: true,
    showTime: '',
    userInfo: {},
    kefuInfo: {},
    is_open: false,
    anima:false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.showToast({
      title: "获取记录...",
      icon: 'loading',
      duration: 10000
    });
    this.getKefu() //获取客服信息
    this.setData({
      userInfo: app.globalData.userInfo
    })
    wx.setNavigationBarTitle({ title: "客服小鼎" })//改变顶部内容
    this.setData({
      showTime: this.getTime(),
    })
    //建立连接
    this.socket()
    //获取聊天记录
      this.getAllMess()
  },
    // 获取聊天记录
    getAllMess(){
      let that = this
      let id = app.globalData.uId
      app.fetchGet(API.interface68+"/"+id,{},(err,res)=>{
        if(res.code==200){
          that.setData({
            anima:true
          })
          that.showAllMess(res.data)
        }
      })
    },
    // 渲染聊天记录
    showAllMess(data){
      for(let i in data){
        let is_user = data[i].from_client_id==app.globalData.uId ? false :true
        this.is_send(data[i],false,is_user,true)
      }
      wx.hideToast();
      let t3 = setTimeout(() => {
        clearTimeout(t3)
        this.setData({
        anima:false
        })
      }, 1000)
      this.scrollTopF( )
    },
  // 下载文件
  downloadFile(e) {
    var src = e.currentTarget.dataset.src;
    console.log(src)
    wx.showModal({
      title: '文件下载',
      content: '您确定要下载文件到本地吗？',
      confirmColor: '#ff8004',
      showCancel: true,
      success: function (res) {
        if (res.confirm) {
          const downloadTask = wx.downloadFile({
            url: src, // 仅为示例，并非真实的资源
            success(res) {
              // 只要服务器有响应数据，就会把响应内容写入文件并进入 success 回调，业务需要自行判断是否下载到了想要的内容
              if (res.statusCode === 200) {
                console.log(res)
                wx.saveFile({
                  tempFilePath: res.tempFilePath,
                  success: function(res) {
                      var saveFilePath = res.savedFilePath   
                      wx.showToast({
                        title: "保存成功！",
                        duration: 2000
                      });
                      console.log(saveFilePath)
                  },//可以将saveFilePath写入到页面数据中
                  fail: function(res) {
                    console.log(res)
                  },
                })
              }
            },
            fail(res){
              console.log(res)
            }
          })
          downloadTask.onProgressUpdate((res) => {
            console.log('下载进度', res.progress)
            console.log('已经下载的数据长度', res.totalBytesWritten)
            console.log('预期需要下载的数据总长度', res.totalBytesExpectedToWrite)
          })
        }
      }
    })
  },
  // websocket发送给服务器
  sendSocketMessage(data) {
    console.log(data)
    let that = this
    if (this.data.is_open) {
      wx.sendSocketMessage({
        data: JSON.stringify(data),
        success(res) {
          if (res.errMsg == "sendSocketMessage:ok") {
            // 加入本地显示信息
            console.log("发送成功")
            that.is_send(data, false,false)
          }
        },
        fail(res) {
          console.log("发送失败")
          that.is_send(data, true,false)
        }
      })
    } else {
      console.log(data)
    }
  }, 

  // 本地展示是否发送成功  第二个参数 是否发送成功 第三个参数 用户/客服发的消息 第四个参数 是否是获取的聊天记录
  is_send(data, bool,is_user,isMess=false) {
    let that =this
    let obj = {} // 消息对象
    let val
    if (data.type == "say") {
      // 聊天记录进来
      if(isMess){
        val = data.content
      }else{
        // 判断是否是客服发送
        val = is_user ? data.content:that.data.val
      }
      // 发送成功
        obj = {
          is_kefu: is_user,
          mess: val,
          type: 'txt',
          error: bool
        }
    } else if (data.type == "image") {
      obj = {
        is_kefu: is_user,
        url: data.content,
        type: 'img',
        error: bool
      }
    } else if (data.type == "file") {
      let res
      if(isMess){
        res = JSON.parse(data.content)
      }else{
        // 判断是否是客服发送
        res = is_user ? JSON.parse(data.content): data.content
      }
        obj = {
        is_kefu: is_user,
        url: res.url,
        type: 'file',
        name: res.file_name,
        size: res.size,
        time: that.getTime(),
        error: bool
      }
    }else{
      return 
    }
    isMess ? that.addMessArr(that, obj,true):that.addMessArr(that, obj)
  },
  // 上传文件到服务器
  uploadFile(tempFilePaths) {
    let that = this
    for (let v in tempFilePaths) {
      // 上传图片到服务器
      wx.uploadFile({
        url: 'https://nearbyfree.cn/v2/upload_image',
        filePath: tempFilePaths[v],
        
        name: 'image',
        success(res) {
          console.log(res)
          let data = JSON.parse(res.data)
          let content = data.data
          if (data.code == 200) {
            let res = {
              type: "image",
              from_client_id: app.globalData.uId,
              to_client_id: that.data.kefuInfo.id,
              content: content,
              created_at: that.getTime(1)
            }
            that.sendSocketMessage(res)
          }
        }
      })

    }
  },
  // 获取文件 并上传
  get_file() {
    let that = this
    wx.chooseMessageFile({
      count: 10,
      type: 'file',
      success(res) {
        wx.showToast({
          title: "上传中...",
          icon: 'loading',
          duration: 10000
        });
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFiles = res.tempFiles
        console.log(tempFiles)
        for (let v in tempFiles) {
          let size = tempFiles[v].size / 1024 // 单位为 KB
          let sizes = size.toFixed(2)       // 保留两位
          if (sizes > 999) {
            sizes = (sizes / 1024).toFixed(2) + 'M'
          } else {
            sizes = size.toFixed(2) + 'KB'
          }
          let time = that.getTime();
          // 上传图片到服务器
          wx.uploadFile({
            url: 'https://nearbyfree.cn/v2/upload_file',
            filePath: tempFiles[v].path,
            formData: {
              file_name: tempFiles[v].name
            },
            name: 'file',
            success(res) {
              let data = JSON.parse(res.data)
              let content = data.data
              if (data.code == 200) {
                wx.hideToast();
                let res = {
                  type: "file",
                  from_client_id: app.globalData.uId,
                  to_client_id: that.data.kefuInfo.id,
                  content: content,
                  created_at: that.getTime(1)
                }
                that.sendSocketMessage(res)
              }
            }
          })
        }
      }
    })
  },
  // 获取客服信息
  getKefu() {
    app.fetchGet(API.interface67, {}, (err, res) => {
      this.setData({
        kefuInfo: res.data
      })
    })
  },
  // 创建连接 初始化
  socket() {

    let that = this
    wx.connectSocket({
      url: wssUrl,
    })
    console.log("创建成功")
    wx.onSocketOpen(function (res) {
      that.setData({
        is_open: true
      })
      wx.hideToast();
      console.log("连接成功")
      let msg = {
        type: 'register',
        id: app.globalData.uId,
      }
      wx.sendSocketMessage({
        data: JSON.stringify(msg)
      })
      // 接收消息
      wx.onSocketMessage(function (res) {
        let data = JSON.parse(res.data);
        // 客户端现实客服发送的内容
        that.is_send(data,false,true)
      })
    })
    // 错误信息
    wx.onSocketError(function (res) {
      console.log(res)
      console.log("无法连接")
      wx.showToast({
        title: "无法连接...",
        icon: 'loading',
        duration: 10000
      });
    })
  },
  // 发送消息
  sendVal() {
    let that = this
    if (this.data.val == '') {
      console.log("请输入内容")
    } else {
      //发送给服务器
      let data = {
        type: "say",
        from_client_id: app.globalData.uId,
        to_client_id: this.data.kefuInfo.id,
        content: this.data.val,
        created_at: this.getTime(1)
      }
      this.sendSocketMessage(data)
    }
  },
  // 获取当前时间
  getTime(key = 0) {
    let time
    var myDate = new Date(),
      y = myDate.getFullYear(),   //获取完整的年份(4位,1970-????)
      m = myDate.getMonth(),     //获取当前月份(0-11,0代表1月)
      d = myDate.getDate(),      //获取当前日(1-31)
      h = myDate.getHours(),    //获取当前小时数(0-23)
      mi = myDate.getMinutes(),   //获取当前分钟数(0-59)
      s = myDate.getSeconds()   //获取当前秒数(0-59)
    m = m < 10 ? "0" + m : m  // 小于10 加个0
    d = d < 10 ? "0" + d : d  // 小于10 加个0
    h = h < 10 ? "0" + h : h  // 小于10 加个0
    mi = mi < 10 ? "0" + mi : mi  // 小于10 加个0
    s = s < 10 ? "0" + s : s  // 小于10 加个0
    time = key == 1 ? y + "-" + m + "-" + d + " " + h + ":" + mi + ":" + s : y + "-" + m + "-" + d
    return time
  },
  // 隐藏添加微信
  hide_addchat() {
    this.setData({
      is_show_add: true
    })
  },
  // 预览文件
  gotoLook(e) {
    var src = e.currentTarget.dataset.src;
    console.log("文件地址为:" + src)
    wx.downloadFile({
      // 示例 url，并非真实存在
      url: src,
      success(res) {
        const filePath = res.tempFilePath
        wx.openDocument({
          filePath,
          success(res) {
            console.log('打开文档成功')
          }
        })
      }
    })
  },
  // 图片预览
  previewImage: function (e) {
    let arr = []
    let messArr = this.data.messArr
    for (let v in messArr) {
      if (messArr[v].url) {
        arr.push(messArr[v].url)
      }
    }

    var current = e.currentTarget.dataset.src;
    console.log("图片url：" + current)
    wx.previewImage({
      current: current,
      urls: arr
    })
  },

  // 获取电话号 
  getPhoneNumber(e) {
    app.fetch(app.globalData.url + API.interface66,
      {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        session_key: app.globalData.session_key
      },
      (err, res) => {
        let phone = res.phoneNumber
        if (phone) {
          wx.showModal({
            title: '提示',
            content: `我们的客服会联系您(${phone})请注意接听`,
            confirmText: '确定',
            confirmColor: '#ff8004',
            showCancel: true,
            success: function (res) {
              if (res.confirm) {
                console.log("用户点击了确定")
              }
            }
          })
        }

      })
  },
  // 客服电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: '18888888888' // 
    })
  },
  // 复制微信号
  addcaht() {
    let that = this
    wx.setClipboardData({
      data: '457340',
      success(res) {
        wx.getClipboardData({
          success(res) {
            that.setData({
              is_show_add: false
            })
          }
        })
      }
    })
  },

  // 从相册读取
  img_xiangce() {
    let that = this
    wx.chooseImage({
      count: 8,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        // 上传文件到服务器
        that.uploadFile(tempFilePaths)
      },
      complete() {
        that.hide()
      }
    })
  },
  // 拍摄
  img_paishe() {
    let that = this
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        that.uploadFile(tempFilePaths)
      },
      complete() {
        that.hide()
      }
    })
  },
  // 选择表情
  addem(e) {
    let id = e.currentTarget.id
    this.setData({
      val: this.data.val + this.data.em[id]
    })
  },
  // 底部随着键盘升起 而升起
  riseBottom(e) {
    let height = e.detail.height * 2 // 输入框上升高度
    this.setData({
      bottom: height,
      toView: "is_bottom",
      height: "0rpx",
      emHeight: "0rpx",
      open_file_url: file_img,
      open_em_url: em_img,
      is_em: true,
      is_file: true,
      bottomH: (de_bottomH + height) + "rpx"
    })
    this.scrollTopF()
  },
  // 滚动到底部
  scrollTopF() {
    this.setData({
      toView: "is_bottom"
    })
  
    let t3 = setTimeout(() => {
      this.setData({
        toView: "is_bottom"
      })
    }, 300)
    let t4 = setTimeout(() => {
      this.setData({
        toView: "is_bottom"
      })
    }, 400)
    let t5 = setTimeout(() => {
      this.setData({
        toView: "is_bottom"
      })
    }, 800)
  },
  // 信息推入消息列表
  addMessArr(that, obj,isScro=false) {
    that.data.messArr.push(obj)
    that.setData({
      messArr: that.data.messArr,
      val: '',
    })
    isScro ? '':that.scrollTopF()
  },
  // 输入的内容
  inputVal(e) {
    this.setData({
      val: e.detail.value
    })
  },

  // 隐藏表情、文件区域
  hide() {
    // 初始化两个弹出层的值
    if (!this.data.is_em && !this.data.is_file) {
      this.hideInput()
      this.scrollTopF()
    }else{
      this.hideInput()
    }
  },
  hideInput() {
    // 初始化两个弹出层的值
    if (!this.data.is_em) {
      this.data.is_em = true
    }
    if (!this.data.is_file) {
      this.data.is_file = true
    }
    this.setData({
      height: "0rpx",
      emHeight: "0rpx",
      bottom: "0rpx",
      bottomH: de_bottomH + "rpx",
      open_file_url: file_img,
      open_em_url: em_img,
      is_em: this.data.is_em,
      is_file: this.data.is_file,
    })
  },
  // 打开/关闭照片选择
  open_file() {
    // 如果表情已开发 将其关闭
    if (!this.data.is_em) {
      let em_url
      em_url = em_img
      this.setData({
        is_em: !this.data.is_em,
        emHeight: "0rpx",
        bottom: "0rpx",
        open_em_url: em_url,
      })
    }
    let url
    if (this.data.is_file) {
      url = "https://www.fawuding.cn/fwd/public/assets/newimg/chat_close.png"
      this.setData({
        is_file: !this.data.is_file,
        height: "400rpx",
        bottom: "400rpx",
        open_file_url: url,
      })
      this.setBottomH()
      this.scrollTopF()
    } else {
      url = file_img
      this.setData({
        is_file: !this.data.is_file,
        height: "0rpx",
        bottom: "0rpx",
        open_file_url: url,
        bottomH: de_bottomH + "rpx",
      })
    }

  },
  // 打开/关闭表情
  open_em() {
    // 如果选择文件已开发 将其关闭
    if (!this.data.is_file) {
      let file_url;
      file_url = file_img
      this.setData({
        is_file: !this.data.is_file,
        height: "0rpx",
        bottom: "0rpx",
        open_file_url: file_url,
      })
    }
    let url
    if (this.data.is_em) {
      url = "https://www.fawuding.cn/fwd/public/assets/newimg/chat_txt.png"
      this.setData({
        is_em: !this.data.is_em,
        emHeight: "400rpx",
        bottom: "400rpx",
        open_em_url: url, 
        bottomH: de_bottomH + "rpx",
      })
      this.setBottomH()
      this.scrollTopF()
    } else {
      url = em_img
      this.setData({
        is_em: !this.data.is_em,
        emHeight: "0rpx",
        bottom: "0rpx",
        open_em_url: url,
        bottomH: de_bottomH + "rpx",
      })
    }
  },
  setBottomH() {
    this.setData({
      bottomH: (de_bottomH + 400) + "rpx"
    })
  }
  
})