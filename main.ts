// add code here
namespace nfc_driver { // Rename to be accurate to the actual device.
  const M24SR64_ADDR_REQUEST = 0xAC
  const M24SR64_ADDR_REPLY = 0xAD
  const M24SR64_REG_SOME_REGISTER = 0x0E
  const polynomial = 0x1021
  const inital_value = 0x6363
  const XOR = 0x0000

  let rxBuf = [10]
  rxBuf[0] =null
  rxBuf[1] = 0
  rxBuf[2]= 0
  rxBuf[3] =1
  rxBuf[4] = 0x02
  rxBuf[5] = 0x00
  rxBuf[6] = 0x90


  // Use export on a function to expose it outside of the namespace.
  // This should be for the functions that you want the API to have.


  export function testing() {


      const filelocation= Buffer.fromArray([0x00, 0xA4, 0X00, 0X0C, 0X02, 0x00, 0x01, ])
      const test = Buffer.fromArray([0x00, 0xA4, 0x04, 0x00, 0x07, 0xD2, 0x76, 0x00, 0x00, 0x85, 0x01, 0x01, 0x00, 0x35, 0xC0])
      const PCB = Buffer.fromArray([0x02])
      const CRC = Buffer.fromArray([0x35, 0xC0])
      const sendlist = PCB.concat(test).concat(CRC)
      const decode = sendlist.toHex()//this line is a must to show the data properly

      const write_param_and_data = Buffer.fromArray([0x00, 0xD6, 0x00, 0x01, 0x01, 0x02, ])
      // const read_param_and_data = Buffer.fromArray([0x00, 0xB0, 0X00, 0X01, , ,0xF6])
      pins.i2cWriteBuffer(M24SR64_ADDR_REQUEST>>1, sendlist, false) //select file location
      const filelocation_reply = pins.i2cReadBuffer(M24SR64_ADDR_REPLY >>1, 4)
      // const filelocation_reply_hex = filelocation_reply.toString()
      // const writereply = pins.i2cWriteBuffer(M24SR64_ADDR_REQUEST>>1, write_param_and_data, false) //write4 data on select location
      // const write_param_and_data_reply = pins.i2cReadBuffer(M24SR64_ADDR_REPLY, 2)
      // const write_param_and_data_reply_hex = write_param_and_data.toString()
      // pins.i2cWriteBuffer(M24SR64_ADDR_REQUEST>>1, filelocation, false) //select file location again
      // const filelocation_reply_2 = pins.i2cReadBuffer(M24SR64_ADDR_REPLY, 2)
      // pins.i2cWriteBuffer(M24SR64_ADDR_REQUEST>>1, read_param_and_data, false)
      // const readbyte=pins.i2cReadBuffer(M24SR64_ADDR_REPLY, 4)

    while (1) 
      {
          for (let i = 0; i < rxBuf.length; i++) {
            serial.writeLine(""+rxBuf[i]);
          }
          // serial.writeBuffer(filelocation)
          // serial.writeBuffer(filelocation_reply)
          // serial.writeString("" + filelocation_reply_hex + "\n")
          // serial.writeBuffer(write_param_and_data)
          // serial.readBuffer(writereply)
          // serial.writeBuffer(write_param_and_data_reply)
         // serial.writeString("" + read_param_and_data + "\r\n")
          // serial.writeString("" + filelocation_reply_2 + "\r\n")
          // serial.writeString("" + readbyte + "\r\n")
          serial.writeString("hello")
          serial.writeLine("the Sendlist is:" + sendlist + "\n")
          serial.writeBuffer(sendlist)
          serial.writeLine("the PCB is:" + PCB + "\n")
          serial.writeBuffer(PCB)
          serial.writeLine("the test is:" + test + "\n")
          serial.writeBuffer(test)
          serial.writeLine("the CRC is:" + CRC + "\n")
          serial.writeBuffer(CRC)
          serial.writeLine("\n decode line is :" + decode + "\n")
          serial.writeLine()
          basic.showIcon(IconNames.Yes)
          basic.pause(1000)
      }
  }
}


nfc_driver.testing()