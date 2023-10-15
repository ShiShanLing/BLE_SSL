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
			console.log("修改后的codedingsOne==", codedingsOne);
 //看样子这个可以,--
			let tempArray = []
			//十进制的数组
			for (let index = 0; index < codedingsOne.length; index++) {
				const element = codedingsOne[index];
				tempArray.push(Number('0x'+element))
			}
			console.log("tempArray==", tempArray);
 			let oneAB = hexStrToBuf(tempArray);
			console.log("看样子这个可以---oneAB=", oneAB);

			//发送数据
			console.log(`deviceId:${that.data.connectedDeviceId} serviceId:${that.data.serviceId} characteristicId:${that.data.characteristicId}`);

			let codedingStr = `0xA1 0x21 LEN ${key} ${key} ${doubleClick} ${longPress} 00 00 00 00 00 00 00 00 00 00 00 00 CRC`
     // var codedingStr = `0xA10x21LEN${key}${click}${doubleClick}${longPress}000000000000000000000000CRC`
   
      console.log("codedingStr==", codedingStr);
 			//0xA1 0x21 LEN 01 11 00 00 00 00 00 00 00 00 00 00 00 00 00 00 CRC
       var buffer = new ArrayBuffer(codedingStr)
       var dataView = new Uint8Array(buffer)
      
      for (var i = 0; i <codedingStr; i++) {
        dataView[i] = codedingStr.charCodeAt(i)
       }
			 console.log("buffer==", buffer);

			 let test_buffer = new ArrayBuffer(20)
			 let test_dataView = new DataView(test_buffer)
			 test_dataView.setUint8(0, 161)
			 test_dataView.setUint8(1, 33)
			 test_dataView.setUint8(2, 0)
			 test_dataView.setUint8(3, 1)
			 test_dataView.setUint8(4, 11)
			 test_dataView.setUint8(5, 0)
			 test_dataView.setUint8(6, 0)
			 test_dataView.setUint8(7, 0)
			 test_dataView.setUint8(8, 0)
			 test_dataView.setUint8(9, 0)
			 test_dataView.setUint8(10, 0)
			 test_dataView.setUint8(11, 0)
			 test_dataView.setUint8(12, 0)
			 test_dataView.setUint8(13, 0)
			 test_dataView.setUint8(14, 0)
			 test_dataView.setUint8(15, 0)
			 test_dataView.setUint8(16, 0)
			 test_dataView.setUint8(17, 0)
			 test_dataView.setUint8(18, 0)
			 test_dataView.setUint8(19, 12)
			 console.log("test_buffer=", test_buffer);
			 console.log("test_buffer.byteLength=", test_buffer.byteLength);
			//  let tmpBuffer = test_buffer.slice(0, 0 + 10);
			//  console.log("tmpBuffer==", tmpBuffer);
			let order = utils.stringToBytes(orderStr);
			 var bytes = test_buffer.byteLength;
			 let pos = 0;
			 while (bytes > 0) {
				let tmpBuffer;
				if (bytes >= 10) {
					tmpBuffer = test_buffer.slice(pos, pos + 10);
					pos += 10;
					bytes -= 10;
					console.log("tmpBuffer=", tmpBuffer);
					wx.writeBLECharacteristicValue({
						deviceId: that.data.connectedDeviceId,
						serviceId: that.data.serviceId,
						characteristicId: that.data.characteristicId,
						value: tmpBuffer,
						// writeType:"writeNoResponse",
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
							console.log('test_dataView发送成功', res)
						},
						fail: function(error) {
							console.log("test_dataView发送失败", error);
						}
					})
				}
			}
			
			//  //BLECharacteristic
      // wx.writeBLECharacteristicValue({
      //   deviceId: that.data.connectedDeviceId,
      //   serviceId: that.data.serviceId,
      //   characteristicId: that.data.characteristicId,
			// 	value: test_buffer,
			// 	// writeType:"writeNoResponse",
      //   success: function (res) {
      //     if (res.errCode != 0){
      //       wx.showModal({
      //         title: '提示',
      //         content: `发送失败:${res.errno}, ${res.errMsg}`,
      //         showCancel: false,
      //         success: function (res) {
      //           that.setData({
      //             searching: false
      //           })
      //         }
      //       })
      //     }
      //     console.log('test_dataView发送成功', res)
			// 	},
			// 	fail: function(error) {
			// 		console.log("test_dataView发送失败", error);
			// 	}
			// })
			// wx.writeBLECharacteristicValue({
      //   deviceId: that.data.connectedDeviceId,
      //   serviceId: that.data.serviceId,
      //   characteristicId: that.data.characteristicId,
			// 	value: test_buffer2,
			// 	// writeType:"writeNoResponse",
      //   success: function (res) {
      //     if (res.errCode != 0){
      //       wx.showModal({
      //         title: '提示',
      //         content: `发送失败:${res.errno}, ${res.errMsg}`,
      //         showCancel: false,
      //         success: function (res) {
      //           that.setData({
      //             searching: false
      //           })
      //         }
      //       })
      //     }
      //     console.log('test_dataView2发送成功', res)
			// 	},
			// 	fail: function(error) {
			// 		console.log("test_dataView2发送失败", error);
			// 	}
      // })
   
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
    that.setData({
      name: options.name,
      connectedDeviceId: options.connectedDeviceId
		})
		console.log("that.data.connectedDeviceId=", that.data.connectedDeviceId);
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
          
         console.log("options.connectedDeviceId:", options.connectedDeviceId);
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
               
                console.log(`打印他的值notify:${data.properties.notify ? 'true':'false'} \nread:${data.properties.read ?  'true':'false'} \nwrite:${data.properties.write ? 'true':'false'}`);
                if(data.properties.notify&&data.properties.read&&data.properties.write){
                   console.log(" element.uuid:",  element.uuid, "data.uuid:", data.uuid, "options.connectedDeviceId:", options.connectedDeviceId);
                  console.log("AddNotify");
									console.log(`connectedDeviceId:${options.connectedDeviceId}`);
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
			console.log("res.value", res.value);
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
	var dataIntView = new Uint8Array(buffer)
  for (let i = 0; i < length; i++) {
		dataview.setUint8(i,arr[i])
		
		// dataIntView[i] = Number('0x' + arr[i])
		// dataIntView[i] = arr[i]
  }
  return buffer
}

