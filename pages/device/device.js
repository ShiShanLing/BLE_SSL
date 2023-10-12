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
			//拍照 11
			//按键 0-2 ? 为什么是三个按钮
			//单击
			let click = "00"//BB
			//双击
			let doubleClick = "11"
			//长按S
			let longPress  = "00"//DD
			let key = "01"
      // var codedingStr = `0xA10x21LEN${key}${click}${doubleClick}${longPress}000000000000000000000000CRC`
      let codedingStr = `0xA1 0x21 LEN ${key} ${func} ${doubleClick} ${longPress} 00 00 00 00 00 00 00 00 00 00 00 00 CRC`
      console.log("codedingStr==", codedingStr);
			//0xA1 0x21 LEN 01 11 00 00 00 00 00 00 00 00 00 00 00 00 00 00 CRC
      var buffer = new ArrayBuffer(codedingStr)
      var dataView = new Uint8Array(buffer)
      for (var i = 0; i <codedingStr; i++) {
        dataView[i] = codedingStr.charCodeAt(i)
      }

      // let arrayBuffer = that.string2buffer(codedingStr)
      // that.getUint8Value(codedingStr, (data)=>{
      //     console.log("getUint8Value:", data);
      // })
      // console.log("arrayBuffer==", arrayBuffer);
      // console.log("dataView.buffer==", dataView.buffer);
      //发送数据
      console.log("  that.data.connectedDeviceId:",   that.data.connectedDeviceId, "that.data.serviceId:", that.data.serviceId, "that.data.characteristicId:",that.data.characteristicId);
      wx.writeBLECharacteristicValue({
        deviceId: that.data.connectedDeviceId,
        serviceId: that.data.serviceId,
        characteristicId: that.data.characteristicId,
        value:  stringToArrayBuffer(codedingStr),
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

function stringToArrayBuffer(str) {
  var bytes = new Array();
  var len, c;
  len = str.length;
  for (var i = 0; i < len; i++) {
    c = str.charCodeAt(i);
    if (c >= 0x010000 && c <= 0x10FFFF) {
      bytes.push(((c >> 18) & 0x07) | 0xF0);
      bytes.push(((c >> 12) & 0x3F) | 0x80);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000800 && c <= 0x00FFFF) {
      bytes.push(((c >> 12) & 0x0F) | 0xE0);
      bytes.push(((c >> 6) & 0x3F) | 0x80);
      bytes.push((c & 0x3F) | 0x80);
    } else if (c >= 0x000080 && c <= 0x0007FF) {
      bytes.push(((c >> 6) & 0x1F) | 0xC0);
      bytes.push((c & 0x3F) | 0x80);
    } else {
      bytes.push(c & 0xFF);
    }
  }
  var array = new Int8Array(bytes.length);
  for (var i = 0; i <= bytes.length; i++) {
    array[i] = bytes[i];
  }
  return array.buffer;
  }