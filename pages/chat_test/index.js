// pages/chat/chat.js
const app = getApp();
import API from "../../utils/api.js";
let phone
let chatH
let em_img = "https://www.fawuding.cn/fwd/public/assets/newimg/chat_em.png"
let file_img = "https://www.fawuding.cn/fwd/public/assets/newimg/chat_open.png"
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // chatHeight: "0",
    // scrollTop: 0,
    // height: "0rpx", // 初始化
    // bottom: "0rpx",
    // emHeight: "0rpx",
    // val: "",  // 用户发送的信息/
    // messArr: [
    //   {
    //     is_kefu: true,
    //     mess: "你好！我是 Po Po",
    //     type: 'txt'
    //   },
    //   {
    //     is_kefu: true,
    //     url: "/image/1.gif",
    //     type: 'img'
    //   },
    //   {
    //     is_kefu: false,
    //     mess: "你好！我是 Laa Laa",
    //     type: 'txt'
    //   }
      


    // ], // 聊天记录集合
    // em: ['😕', '😛', '😎', '😅', '😬', '😵', '😡',
    //   '😊', '😅', '😲', '😭', '😂', '😄', '😩',
    //   '😞', '😵', '😒', '😍', '😤', '😜', '😝',
    //   '😋', '😘', '😚', '😷', '😳', '😃', '😆',
    //   '😁', '😢', '😨', '😠', '😣', '😌', '😖',
    //   '😔', '😰', '😱', '😪', '😏', '😓'
    // ],

    // open_em_url: em_img,
    // open_file_url: file_img,
    // is_em: true,
    // is_file: true,
    // is_show_add:true,
    // toView:"is_bottom"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {


    // var query = wx.createSelectorQuery();
    // //选择id
    // var that = this;
    // query.select('.every').boundingClientRect(function (rect) {
    //   // console.log(rect.width)
    //   that.setData({
    //     height: rect.width + 'px'
    //   })
    // }).exec();

    // this.setData({
    //   userInfo: app.globalData.userInfo,
    //   uid: app.globalData.uId
    // })
    this.get_key()
    wx.setNavigationBarTitle({ title: "客服小鼎" })//改变顶部内容
    chatH = (app.globalData.height)*2 -440
    console.log("聊天框高度:" + chatH)
    this.setData({
      chatHeight: chatH + "rpx"
    })
    that.scrollTopF()
  },

  //   // 预览文件
  gotoLook(e){
    var src=e.currentTarget.dataset.src;
    console.log(src)
    // wx.downloadFile({
      // 示例 url，并非真实存在
      // url: e.currentTarget.dataset.src,
      // success(res) {
      //   const filePath = res.tempFilePath
        // wx.openDocument({
        //   src,
        //   success(res) {
        //     console.log('打开文档成功')
        //   }
        // })
    //   }
    // })
  },
  // // 图片预览
  previewImage: function (e) {  
    let arr = []
    let messArr = this.data.messArr
    for(let v in messArr){
      if(messArr[v].url){
        arr.push(messArr[v].url)
      }
    }
    
    var current=e.currentTarget.dataset.src;
		wx.previewImage({
		  	current: current,
		  	urls: arr
		})
	},
  // // 获取文件
  get_file(){
    let that = this
    wx.chooseMessageFile({
      count: 10,
      type: 'file',
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        const tempFiles = res.tempFiles
        for (let v in tempFiles) {
          var myDate = new Date(),
              y = myDate.getFullYear(),   //获取完整的年份(4位,1970-????)
              m = myDate.getMonth(),     //获取当前月份(0-11,0代表1月)
              d = myDate.getDate()      //获取当前日(1-31)
              if(m<10){
                m = '0'+m
              }
              if(d<10){
                d = '0'+d
              }
          let size = tempFiles[v].size /1024 // 单位为 KB
          let sizes = size.toFixed(2)       // 保留两位
          if(sizes>999){
            sizes = (sizes /1024).toFixed(2) +'M'
          }else{
            sizes = size +'KB'
          }
            console.log(sizes)
          let time =y+"-"+m+"-"+d
          let obj = {}
          obj = {
            is_kefu: false,
            url: tempFiles[v].path,
            type: 'file',
            name:tempFiles[v].name,
            size:sizes,
            time:time
          }
          that.addMessArr(that,obj)
        }
      }
    })
  },
  // // 获取电话号 
  getPhoneNumber(e) {
    console.log(e.detail)
    app.fetch(app.globalData.url + API.interface66,
      {
        encryptedData: e.detail.encryptedData,
        iv: e.detail.iv,
        session_key: app.globalData.session_key
      },
      (err, res) => {
        phone = res.phoneNumber
        if(phone){
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
  get_key() {
    wx.login({
      success: res => {
        app.fetch(app.globalData.url + API.interface65, { code: res.code }, (err, res) => {
          console.log(res)
          app.globalData.openid = res.openid
          app.globalData.session_key = res.session_key
        })
      }
    })
  },

  // // 客服电话
  callPhone() {
    wx.makePhoneCall({
      phoneNumber: '18888888888' // 
    })
  },
  // // 复制微信号
  addcaht() {
    let that = this
    wx.setClipboardData({
      data: '457340',
      success(res) {
        wx.getClipboardData({
          success(res) {
            that.setData({
              is_show_add:false
            })
          }
        })
      }
    })
  },

  // // 从相册读取
  img_xiangce() {
    let that = this
    wx.chooseImage({
      count: 8,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths
        for (let v in tempFilePaths) {

          let obj = {}
          obj = {
            is_kefu: false,
            url: tempFilePaths[v],
            type: 'img'
          }
          that.addMessArr(that,obj)
        }
      },
      complete() {
        that.hide()
      }
    })
  },
  // // 拍摄
  img_paishe() {
    let that = this
    wx.chooseImage({
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success(res) {
        // tempFilePath可以作为img标签的src属性显示图片
        let tempFilePaths = res.tempFilePaths[0]
        let obj = {}
        obj = {
          is_kefu: false,
          url: tempFilePaths,
          type: 'img'
        }
        that.addMessArr(that,obj)
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
  // 发送消息
  sendVal() {
    let that = this
    if (this.data.val == '') {
      console.log("请输入内容")
    } else {
      // console.log(this.data.val)
      let obj = {}
      obj = {
        is_kefu: false,
        mess: this.data.val,
        type: 'txt'
      }
      that.addMessArr(that,obj)
    }
  },
  // 输入的内容
  inputVal(e) {
    this.setData({
      val: e.detail.value
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
      let height = (chatH - 410) + "rpx";
      this.setData({
        is_file: !this.data.is_file,
        height: "410rpx",
        bottom: "410rpx",
        open_file_url: url,
        chatHeight: height // 计算弹出表情、文件后的滚动盒子高度
      })
      this.scrollTopF()
    } else {
      url = file_img
      this.setData({
        is_file: !this.data.is_file,
        height: "0rpx",
        bottom: "0rpx",
        open_file_url: url,
        chatHeight: chatH + "rpx"
      })
    }

  },
  // // 打开/关闭表情
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
        chatHeight: (chatH - 410) + "rpx",
      })
      this.scrollTopF()
    } else {
      url = em_img
      this.setData({
        is_em: !this.data.is_em,
        emHeight: "0rpx",
        bottom: "0rpx",
        open_em_url: url,
        chatHeight: chatH + "rpx"
      })
    }
  },
  // 隐藏表情、文件区域
  hide() {
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
      open_file_url: file_img,
      open_em_url: em_img,
      chatHeight: chatH + "rpx",
      is_em: this.data.is_em,
      is_file: this.data.is_file,
    })
  },
  // 底部随着键盘升起 而升起
  riseBottom(e) {
    let height = e.detail.height * 2 + "rpx"  // 输入框上升高度
    let srcHeight = (chatH - e.detail.height * 2) + "rpx" //键盘升起 滚动框高度
    console.log(srcHeight)
    this.setData({
      bottom: height,
      chatHeight: srcHeight,
      toView: "is_bottom",
      height: "0rpx",
      emHeight: "0rpx",
      open_file_url: file_img,
      open_em_url: em_img,
      is_em: true,
      is_file: true,
    })
    this.scrollTopF()
    console.log(this.data.chatHeight)

  },
  // 滚动到底部
  scrollTopF() {
    this.setData({
      toView: "is_bottom"
    })  
  },
// 信息推入消息列表
  addMessArr(that,obj){
    that.data.messArr.push(obj)
        that.setData({
          messArr: that.data.messArr,
          val: '',
        })
    that.scrollTopF()
  },
  //隐藏添加微信
  hide_addchat(){
    this.setData({
      is_show_add:true
    })
  }
})