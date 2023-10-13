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
			let key = "01"
			//拍照 11
			//按键 0-2 ? 为什么是三个按钮
			//单击
			let click = "11"
			//十进制转16进制
			const clickHex = Number(click).toString(16);
			//双击
			let doubleClick = "00"
			const doubleClickHex = Number(doubleClick).toString(16);
			//长按
			let longPress  = "00"
			const longPressHex = Number(longPress).toString(16);
			console.log(`clickHex=${clickHex} doubleClickHex=${doubleClickHex} longPressHex=${longPressHex}`);
			let codedingsOne = ['A1', '21', '00', key, clickHex, doubleClickHex, longPressHex, '00', '00', '00', '00','00', '00', '00', '00', '00', '00', '00', '00', 'FF'];
			//计算3-18
			let total = 0
			for (let index = 3; index < 19; index++) {
				let tn = Number('0x'+codedingsOne[index])
				total += tn;
				console.log('十进制', tn);
			}
			console.log("总大小应该是12---", total);
			codedingsOne[19] = total.toString(16)
 //看样子这个可以,--
 			let oneAB = hexStrToBuf(codedingsOne);
			console.log("看样子这个可以---oneAB=", oneAB);

			//发送数据
      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.services[0].uuid,
        characteristicId: that.data.characteristics[0].uuid,
        value: oneAB,
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


// hex转ArrayBuffer
function hexStrToBuf(arr) {
  var length = arr.length
  var buffer = new ArrayBuffer(length)
  var dataview = new DataView(buffer)
  for (let i = 0; i < length; i++) {
    dataview.setUint8(i, '0x' + arr[i])
  }
  return buffer
}