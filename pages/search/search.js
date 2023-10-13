const app = getApp()
Page({
  data: {
    searching: false,
    devicesList: []
  },
  Search: function () {
    var that = this
    if (!that.data.searching) {
      wx.closeBluetoothAdapter({
        complete: function (res) {
          console.log(res)
          wx.openBluetoothAdapter({
            success: function (res) {
              console.log(res)
              wx.getBluetoothAdapterState({
                success: function (res) {
                  console.log(res)
                }
              })
              wx.startBluetoothDevicesDiscovery({
                allowDuplicatesKey: false,
                success: function (res) {
                  console.log(res)
                  that.setData({
                    searching: true,
                    devicesList: []
                  })
                }
              })
            },
            fail: function (res) {
              console.log(res)
              wx.showModal({
                title: '提示',
                content: '请检查手机蓝牙是否打开',
                showCancel: false,
                success: function (res) {
                  that.setData({
                    searching: false
                  })
                }
              })
            }
          })
        }
      })
    } else {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
  },
  Connect: function (e) {
    var that = this
    var advertisData, name
    console.log(e.currentTarget.id)
    for (var i = 0; i < that.data.devicesList.length; i++) {
      if (e.currentTarget.id == that.data.devicesList[i].deviceId) {
        name = that.data.devicesList[i].name
        advertisData = that.data.devicesList[i].advertisData
      }
    }
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
        console.log(res)
        that.setData({
          searching: false
        })
      }
    })
    wx.showLoading({
      title: '连接蓝牙设备中...',
		})
		let dev = "4DA926D6-0A9B-6C89-5B8D-CA5660D04C01";
		//e.currentTarget.id
    //开始链接
    wx.createBLEConnection({
      deviceId: dev,
      success: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        wx.navigateTo({
          url: '../device/device?connectedDeviceId=' + e.currentTarget.id + '&name=' + name
        })
      },
      fail: function (res) {
        console.log(res)
        wx.hideLoading()
        wx.showModal({
          title: '提示',
          content: '连接失败',
          showCancel: false
        })
      }
    })
  },
  onLoad: function (options) {
    /*
    思路1:吧字符串转 Buffer 发送过去.
    思路二发送过去的字符串就是A1-这个不可能 不可能发字符串
    */
    //把需要传输的 hexStr 转成 ArrayBuffer

    // 存储需要发送的数据，元素用2位16进制表示
		/*
		   // 将数组转换为8位无符号整型数组 这里对 codedingsOne数组的要求是带有0x的数据.
    let bufferView = new Uint8Array(codedingsOne);
		let buffer = bufferView.buffer;


		那么到此为止,ArrayBuffer数据搞定了.那么CRC怎么计算?
		
		*/


		let codedingsOne = ['A1', '21', '00', '01', '11', '00', '00', '00', '00', '00', '00', '00', '00', '00', '00','00', '00', '00', '00', 'FF'];
		//没有11这个字符串
		let num1 = 1;
		let num = 11;
		//十进制转16进制
		const hex = num.toString(16);
		let crcList = [num1.toString(16), hex];
		console.log("crcList==", crcList);
		let total = 0;
		for (const key in crcList) {
			let tn = Number('0x'+crcList[key])
			total += tn;
			console.log(tn);
		}
		let crc_result_10 = total % 256;
		console.log("crc_result_10==", crc_result_10);
		const crc_16 = crc_result_10.toString(16);
		console.log("crc_16==", crc_16);
		//这里如果只有一位要补0


		
    //看样子这个可以,--
    let oneAB = hexStrToBuf(codedingsOne);
    console.log("看样子这个可以---oneAB=", oneAB);
    //
    let hexStr = abTohex(oneAB);
    console.log("hexStr==", hexStr);

    // let codedings = ['0xA1', '0x21', 'LEN', '01', '11', '00', '00', 'CRC'];
    // let codedings = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14','A15'];
    let codedings = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13', 'A14', 'A15'];
    // let codeStr = "0xA1 0x21 LEN 01 11 00 00 00 00 00 00 00 00 00 00 00 00 00 00 CRC";
    let codeStr = "0xA10xA2";

    function str2ab(strs) {
      var buf = new ArrayBuffer(strs.length);
      var bufView = new Uint8Array(buf);
      for (var i = 0, strLen = strs.length; i < strLen; i++) {
        let oldStr = strs[i];
        let newStr = parseInt(oldStr, 16);
        oldStr = "0x" + oldStr

        // console.log("oldStr==", oldStr, "newStr==", newStr);
        bufView[i] = 161 + i;
      }
      return buf;
    }
    let tempBU = str2ab(codedings);

    console.log("tempBU===", tempBU);
    let resule_crc = crc16(tempBU, 8)
    console.log("resule_crc==", resule_crc);

    // new ArrayBuffer.from("A1A2A3A4A5A6A7A8A9A10A11A12A13A14A15","hex")
    // ArrayBuffer
    // TypedArray
    var that = this
    var list_height = ((app.globalData.SystemInfo.windowHeight - 50) * (750 / app.globalData.SystemInfo.windowWidth)) - 60
    that.setData({
      list_height: list_height
    })
    wx.onBluetoothAdapterStateChange(function (res) {
      console.log(res)
      that.setData({
        searching: res.discovering
      })
      if (!res.available) {
        that.setData({
          searching: false
        })
      }
    })
    wx.onBluetoothDeviceFound(function (devices) {
      //剔除重复设备，兼容不同设备API的不同返回值
      var isnotexist = true
      if (devices.deviceId) {
        if (devices.advertisData) {
          devices.advertisData = app.buf2hex(devices.advertisData)
        } else {
          devices.advertisData = ''
				}
				
				
        console.log(devices)
        for (var i = 0; i < that.data.devicesList.length; i++) {
          if (devices.deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices)
        }
      } else if (devices.devices) {
        if (devices.devices[0].advertisData) {
          devices.devices[0].advertisData = app.buf2hex(devices.devices[0].advertisData)
        } else {
          devices.devices[0].advertisData = ''
        }
        console.log(devices.devices[0])
        for (var i = 0; i < that.data.devicesList.length; i++) {
          if (devices.devices[0].deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices.devices[0])
        }
      } else if (devices[0]) {
        if (devices[0].advertisData) {
          devices[0].advertisData = app.buf2hex(devices[0].advertisData)
        } else {
          devices[0].advertisData = ''
        }
        console.log(devices[0])
        for (var i = 0; i < devices_list.length; i++) {
          if (devices[0].deviceId == that.data.devicesList[i].deviceId) {
            isnotexist = false
          }
        }
        if (isnotexist) {
          that.data.devicesList.push(devices[0])
        }
      }
      that.setData({
        devicesList: that.data.devicesList
      })
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {
    var that = this
    that.setData({
      devicesList: []
    })
    if (this.data.searching) {
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          console.log(res)
          that.setData({
            searching: false
          })
        }
      })
    }
  }
})

function TypedArrays(Type, Bin, begin, Num) {
  switch (Type) {
    case 0:
      return new Int8Array(Bin, begin, Num)[0];
    case 1:
      return new Uint8Array(Bin, begin, Num)[0];
    case 2:
      return new Int16Array(Bin, begin, Num)[0];
    case 3:
      return new Uint16Array(Bin, begin, Num)[0];
    case 4:
      return new Int32Array(Bin, begin, Num)[0];
    case 5:
      return new Uint32Array(Bin, begin, Num)[0];
    case 6:
      return new Float32Array(Bin, begin, Num)[0];
    case 7:
      return new Float64Array(Bin, begin, Num)[0];
    default:
      return -1;
  }
}

// hex转ArrayBuffer
function hexStrToBuf(arr) {
  var length = arr.length
  var buffer = new ArrayBuffer(length)
	// var dataview = new DataView(buffer)
	var dataIntView = new Uint8Array(buffer)
  for (let i = 0; i < length; i++) {
		// dataview.setUint8(i, '0x' + arr[i])
		dataIntView[i] = '0x' + arr[i]
	}

	console.log("Uint8Array==", dataIntView);
	// console.log("DataView==", dataview);
	console.log("buffer==", buffer);

  return dataIntView
}
// ArrayBuffer转16进度字符串示例
function abTohex(buffer) {
  const hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('')
}
//
var crc16 = function (buffer, len) {
  var crc = 0xFFFF;
  for (var pos = 0; pos < len; pos++) {
    var x = 0x0000;
    x = TypedArrays(1, buffer, pos, 1);
    crc ^= x // XOR byte into least sig. byte of crc
    for (var i = 8; i != 0; i--) // Loop over each bit
    {
      if ((crc & 0x0001) != 0) // If the LSB is set
      {
        crc >>= 1; // Shift right and XOR 0xA001
        crc ^= 0xA001;
      } else // Else LSB is not set
      {
        crc >>= 1; // Just shift right
      }

    }
  } //高低字节转换

  return crc;
}


function CRC16func(AllDATA) {
	var cnCRC_CCITT = 0x1021;
	var i = -1,
		j = -1;
	var nData = -1,
		nAccum = -1,
		nYAccum = -1;
	var Table_CRC = [];
	var aSize = AllDATA.length;
	for (i = 0; i  <  256; i++) {
		nData = C16func.call(this, i, 8); 
		nAccum = 0;
		for (j = 0; j  <  8; j++) { 
			if ((nData ^ nAccum) & 0x8000) { 
				nAccum = C16func.call(this, nAccum, 1); 
				nAccum = nAccum ^ cnCRC_CCITT; 
			} else { 
				nAccum = C16func.call(this, nAccum, 1); 
				nAccum = nAccum;
			}
			nData = C16func.call(this, nData, 1); 
		}
		Table_CRC[i] = nAccum;
	} 
	nAccum = 0;
	for (i = 0; i  <  aSize; i++) { 
		nYAccum = nAccum; 
		nAccum = C16func.call(this, nAccum, 8); 
		nAccum = nAccum ^ Table_CRC[(nYAccum  >>> 8) ^ (AllDATA[i])];//数组
		// nAccum = nAccum ^ Table_CRC[(nYAccum  >>> 8) ^ (AllDATA.charCodeAt(i))];//字符串
	} 
	return  nAccum.toString(16).toUpperCase();
}


function  C16func(cData, cLen) { 
	if (((cData  <<  cLen).toString(2).length  >  16) && (cData.toString(2).length  <=  16)) { 
		cData = (cData  <<  cLen).toString(2).substr((cData  <<  cLen).toString(2).length - 16, 16); 
		cData = parseInt(cData, 2);
	} else { 
		cData = cData  <<  cLen;
	}
	return  cData; 
}

var data = [0x7E, 0x00, 0x05, 0x60, 0x31, 0x32, 0x33];
var data1 = ['0xA1', '0x11', '00', '00', '00', '00', '00', '00', '00', '00', '00', '00', '00', , '00', '00', 'FF'];
let data2 = [0xA1, 0xA2, 0xA3, 0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xA10, 0xA11, 0xA12, 0xA13, 0xA14, 0xA15];
let data3 = ['0xA1', '0xA2', '0xA3', '0xA4', '0xA5', '0xA6', '0xA7', '0xA8', '0xA9', '0xAA', '0xAB', '0xAC', '0xAD', '0xAE', '0xAF'];


console.log("CRC16func==", CRC16func(data2));

//16进制转10进制相加得出最低8位

function test(){
	let tatol = 0;
	for (let index = 0; index < data2.length; index++) {
		const element = data2[index].toString();
		
		console.log("element==", element);
		let temp = parseInt(element, 16).toString(10)
		tatol += Number(temp);
	}
	let result = tatol%256;
	console.log("result===", result, tatol);
}
test();

//16 转 10
function hex2dex(str) {
  return parseInt(str, 16).toString(10)
}

//16进制转10进制