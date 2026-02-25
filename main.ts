let rawData = ""
let IMGMode = true
let StringList: string[] = []
let ImageList: string[] = []
let currentIndex = 0
basic.showIcon(IconNames.Yes)
MFRC522.Init()

input.onButtonPressed(Button.AB, function () {
    IMGMode = !IMGMode //to switch between true and false

    if (IMGMode) //visual feedback
    {
        basic.showString("I")
    }else
    {
        basic.showString("S")
    }
})

input.onButtonPressed(Button.B, function()
{
    //iterate to next available datablock of same type
    if (StringList.length > 0)
    {
        currentIndex += 1

        //wrap around if over the last item
        if (currentIndex >= StringList.length)
        {
            currentIndex = 0
        }
        //Display the selected StringList
        displaystring(StringList[currentIndex])
        serial.writeLine("Record: (" + StringList[0] + ") (text) (String " + currentIndex + "")
    }else
    {
        basic.showIcon(IconNames.No)
    }
})

function displayPattern(payload: string)
{
    basic.clearScreen()

    for (let i = 0; i < 25; i++)
    {
        if (payload.charAt(i) == "1")
        {
            let x = i% 5
            let y = Math.idiv(i, 5)
            led.plot(x, y)
        }
    }
}

function displaystring(payload: string)
{
    basic.clearScreen()

    basic.showString(payload, 100)
}

basic.forever(function () 
{
    // let result = MFRC522.Request(MFRC522.PICC_REQIDL)
    // let status = result[0]
    // if (status == 0)
    // {
        rawData = MFRC522.read()
        serial.writeLine(rawData)
        if (rawData.length > 0) 
        {
            if (IMGMode)
            {
                let IndexIMG = rawData.indexOf("IMG")
                if (IndexIMG != -1) 
                {
                    let endOfId = rawData.indexOf("en", IndexIMG)
                    let id = rawData.substr(IndexIMG, (endOfId - IndexIMG))
                    // load data payload
                    let dataStart = endOfId + 2 // +2 to skip over "en"
                    let dataPayload = rawData.substr(dataStart, 25)
                    // Output: Record: (data) (recordType) (id)
                    serial.writeLine("Record: (" + dataPayload + ") (text) (" + id + ")")

                    displayPattern(dataPayload)

                    serial.writeLine("IMG ID: " + id)
                    // basic.showIcon(IconNames.Happy)
                }
            }
            else
            {
                // if there are any STRING type data
                if (rawData.indexOf("STRING") != -1)
                {
                    StringList = []
                    currentIndex = 0

                    let searchPosition = 0
                    while (rawData.indexOf("en", searchPosition) != -1)
                    {
                        let start = rawData.indexOf("en", searchPosition) //start of data
                        let nextBlock = rawData.indexOf("STRING", start) //find next string datablock         
                        let dataPayload = ""

                        //since a data block is fixed to 25 bytes on webNFC, set it to 25 byte length
                        dataPayload = rawData.substr(start +2 , 25)

                        StringList.push(dataPayload)
                        searchPosition = start + 25
                    }
                    
                    // Output: Record: (data) (recordType) (id)
                    // 
                    if (StringList.length > 0)
                    {
                        displaystring(StringList[0])
                        serial.writeLine("Record: (" + StringList[0] + ") (text)")
                    }
                }
            }
        }
        rawData = ""
    // }
    // else 
    // {
    //     // If it's a tag but not your specific format
    //     basic.showIcon(IconNames.SmallDiamond)
    // }

    basic.pause(3000)
    
})
