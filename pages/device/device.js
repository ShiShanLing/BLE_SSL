const app = getApp()
Page({
  data: {
    inputText: 'Hello World!',
    receiveText: '',
    name: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    connected: true
  },
  bindInput: function (e) {
    this.setData({
      inputText: e.detail.value
    })
    console.log(e.detail.value)
  },
  Send: function () {
    var that = this
    if (that.data.connected) {
			//拍照 11
			//按键 0-2 ? 为什么是三个按钮
			//单击
			let click = "11"
			//双击
			let doubleClick = "CC"
			//长按
			let longPress  = "DD"
			let key = "01"


			let codedingStr = `0xA1 0x21 LEN ${key} ${func} ${doubleClick} ${longPress} 00 00 00 00 00 00 00 00 00 00 00 00 CRC`
		

      var buffer = new ArrayBuffer(codedingStr)
      var dataView = new Uint8Array(buffer)
      for (var i = 0; i < that.data.inputText.length; i++) {
        dataView[i] = that.data.inputText.charCodeAt(i)
      }
			//发送数据
      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.services[0].uuid,
        characteristicId: that.data.characteristics[0].uuid,
        value: buffer,
        success: function (res) {
          console.log('发送成功')
        }
      })
    }
    else {
      wx.showModal({
        title: '提示',
        content: '蓝牙已断开',
        showCancel: false,
        success: function (res) {
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  onLoad: function (options) {
    var that = this
    console.log(options)
    that.setData({
      name: options.name,
      connectedDeviceId: options.connectedDeviceId
    })
    wx.getBLEDeviceServices({
      deviceId: that.data.connectedDeviceId,
      success: function (res) {
        console.log(res.services)
        that.setData({
          services: res.services
        })
        wx.getBLEDeviceCharacteristics({
          deviceId: options.connectedDeviceId,
          serviceId: res.services[0].uuid,
          success: function (res) {
						//获取到设备列表
						console.log(res.characteristics)
            that.setData({
              characteristics: res.characteristics
						})
						res.characteristics.forEach((data)=>{
							console.log(`打印他的值notify:${data.properties.notify ? 'true':'false'} \nread:${data.properties.read ?  'true':'false'} \nwrite:${data.properties.write ? 'true':'false'}`);
						})
						//这里直接读取第一个不行.因为有可能不允许读写
            wx.notifyBLECharacteristicValueChange({
              state: true,
              deviceId: options.connectedDeviceId,
              serviceId: that.data.services[0].uuid,
              characteristicId: that.data.characteristics[0].uuid,
              success: function (res) {
                console.log('启用notify成功')
              }
            })
          }
        })
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log(res.connected)
      that.setData({
        connected: res.connected
      })
    })
    wx.onBLECharacteristicValueChange(function (res) {
      var receiveText = app.buf2string(res.value)
      console.log('接收到数据：' + receiveText)
      that.setData({
        receiveText: receiveText
      })
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  }
})

