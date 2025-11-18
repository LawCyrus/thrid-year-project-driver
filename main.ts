// add code here
namespace nfc_driver { // Rename to be accurate to the actual device.
  const M24SR64_ADDR_REQUEST = 0xAC
  const M24SR64_ADDR_REPLY = 0xAD
  const test_address = 0x56 //0xAD but right shift
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

    while (1) 
      {
      const filelocation= Buffer.fromArray([0x00, 0xA4, 0X00, 0X0C, 0X02, 0x00, 0x01, ])
      const selectNFC = Buffer.fromArray([0x04, 0x00, 0x07, 0xD2, 0x76, 0x00, 0x00, 0x85, 0x01, 0x01, 0x00]) //selectnfc tag
      const CCfile1 = Buffer.fromArray([0x02, 0xE1, 0x03])
      const PCB1 = Buffer.fromArray([0x02])
      const PCB2 = Buffer.fromArray([0x03])
      const CRC = Buffer.fromArray([0x35, 0xC0])
      const file_select = Buffer.fromArray([0x00, 0x0C]) //CC select, System file select, NDEF select parameter
      const selectfunction = Buffer.fromArray([0x00, 0xA4]) //select class byte
      const readfunction = Buffer.fromArray([0x00, 0xB0]) //read class byte
      const writefunction = Buffer.fromArray([0x00, 0xD6]) //write class byte
      const selectNFCapp = PCB1.concat(selectfunction).concat(selectNFC).concat(CRC)
      const selectCCfile = PCB2.concat(selectfunction).concat(file_select).concat(CCfile1)

      const startI2C = Buffer.fromArray([0x52]) //bascially 0xAV but right shift
      const decode = selectNFCapp.toHex()//all the buffer replies needs to have /tohex() to shwo properly in the serial

      const write_param_and_data = Buffer.fromArray([0x00, 0xD6, 0x00, 0x01, 0x01, 0x02, ])
      // const read_param_and_data = Buffer.fromArray([0x00, 0xB0, 0X00, 0X01, , ,0xF6])
      pins.i2cWriteBuffer(M24SR64_ADDR_REPLY >> 1, startI2C, false) //requies to START the I2C session, no replies is will sent back
      basic.pause(1000) //delay to allow NFC tag to process

      pins.i2cWriteBuffer(M24SR64_ADDR_REPLY >> 1, selectNFCapp, false) //send a selectNDEFTAG Applciation to the NTC tag
      basic.pause(1000)

      const filelocation_reply: Buffer = pins.i2cReadBuffer(M24SR64_ADDR_REPLY >> 1, 5)
      basic.pause(1000)
      const decode2 = filelocation_reply.toHex()

      serial.writeLine("\n decode line is :" + decode + "\n")
      serial.writeLine("\n reply decode line is :" + decode2 + "\n")
      basic.showIcon(IconNames.Yes)
      }
  }
}


nfc_driver.testing()