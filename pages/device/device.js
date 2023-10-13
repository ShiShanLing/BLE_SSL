const app = getApp()
Page({
  data: {
    inputText: 'Hello World!',
    receiveText: '',
    name: '',
    connectedDeviceId: '',
    services: {},
    characteristics: {},
    connected: true,
    serviceId:'',
    characteristicId:''

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
          if (res.errCode != 0){
            wx.showModal({
              title: '提示',
              content: `发送失败:${res.errno}, ${res.errMsg}`,
              showCancel: false,
              success: function (res) {
                that.setData({
                  searching: false
                })
              }
            })
          }
          console.log('发送成功', res)
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
  CloseBLEConnection:function(){
    var that = this
    // wx.closeBLEConnection({
    //   deviceId: that.data.connectedDeviceId,
    // })
    // console.log("closeBLEConnection:", that.data.connectedDeviceId);
    wx.closeBLEConnection({
      deviceId: that.data.connectedDeviceId,
      success: function(res){
        console.log('断开蓝牙', res);
      }
    })
  },
  getUint8Value: function (e, t) {
    for (var a = e, i = new DataView(a), n = "", s = 0; s < i.byteLength; s++) n += String.fromCharCode(i.getUint8(s));
    t(n);
  },
  string2buffer:function (str) {
    if (!str) return;
    var val = "";
    for (var i = 0; i < str.length; i++) {
        val += str.charCodeAt(i).toString(16);
    }
    str = val;
    val = "";
    let length = str.length;
    let index = 0;
    let array = []
    while (index < length) {
        array.push(str.substring(index, index + 2));
        index = index + 2;
    }
    val = array.join(",");
    // 将16进制转化为ArrayBuffer
    return new Uint8Array(val.match(/[\da-f]{2}/gi).map(function (h) {
        return parseInt(h, 16)
    })).buffer
  },
  onLoad: function (options) {
    var that = this
    console.log(options)
    console.log("stringToArrayBuffer", stringToArrayBuffer("0xA10x21LEN01001100000000000000000000000000CRC"));
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
        console.log(" res.services==",  res.services);
        for (let index = 0; index < res.services.length; index++) {
          const element = res.services[index];
          
         
          wx.getBLEDeviceCharacteristics({
            deviceId: options.connectedDeviceId,
            serviceId:element.uuid,
            success: function (res) 
            {
              console.log("index==", index, "elemen==t", element.uuid);
              //获取到设备列表
              console.log("getBLEDeviceCharacteristics:",res.characteristics)
              that.setData({
                characteristics: res.characteristics
              })
              res.characteristics.forEach((data)=>{
               
                // console.log(`打印他的值notify:${data.properties.notify ? 'true':'false'} \nread:${data.properties.read ?  'true':'false'} \nwrite:${data.properties.write ? 'true':'false'}`);
                if(data.properties.notify&&data.properties.read&&data.properties.write){
                   console.log(" element.uuid:",  element.uuid, "data.uuid:", data.uuid, "options.connectedDeviceId:", options.connectedDeviceId);
                  console.log("AddNotify");
                  
                  that.setData({
                    serviceId: element.uuid,
                    characteristicId:data.uuid
                  })
                  that.AddNotify(options.connectedDeviceId, element.uuid, data.uuid)
                
                 }

              })
              //这里直接读取第一个不行.因为有可能不允许读写
             
            }
          })
        }
       
      }
    })
    wx.onBLEConnectionStateChange(function (res) {
      console.log('onBLEConnectionStateChange==', res.connected)
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
  AddNotify:function(deviceId,serviceId, characteristicId){
    wx.notifyBLECharacteristicValueChange({
      state: true,
      deviceId: deviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      success: function (res) {
        console.log('启用notify成功')
      },
      fail:function(res){
        console.log('notifyBLECharacteristicValueChange=error==',res);
      }
    
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
