function displayPattern (payload: string) 
{
    basic.clearScreen()
    for (let i = 0; i <= 24; i++) 
    {
        if (payload.charAt(i) == "1") 
        {
            let x = i % 5
            let y = Math.idiv(i, 5)
            led.plot(x, y)
        }
    }
}
function displaystring (payload: string) 
{
    basic.clearScreen()
    basic.showString(payload, 100)
}
// visual image to tell user the NFC card is reading
function loadingdata () 
{
    let delay = 200
    led.plot(2, 1)
    basic.pause(delay)
    led.plot(3, 2)
    basic.pause(delay)
    led.plot(2, 3)
    basic.pause(delay)
    led.plot(1, 2)
    basic.pause(delay)
    led.unplot(2, 1)
    led.unplot(3, 2)
    led.unplot(2, 3)
    led.unplot(1, 2)
}
input.onButtonPressed(Button.AB, function () 
{
    // to switch between true and false
    IMGMode = !(IMGMode)
    // visual feedback
    if (IMGMode) 
    {
        basic.showString("I")
    } else 
    {
        basic.showString("S")
    }
})
input.onButtonPressed(Button.B, function () 
{
    let activeList = IMGMode ? ImageList : StringList
    if (activeList.length > 0) 
    {
        currentIndex += 1
        // wrap around if over the last item
        if (currentIndex >= activeList.length) 
        {
            currentIndex = 0
        }

        // Display data based on the current mode
        if (IMGMode) 
        {
            displayPattern(activeList[currentIndex])
        } else 
        {
            displaystring(activeList[currentIndex])
        }
        serial.writeLine("Switching to index: " + currentIndex)
    } 
    else 
    {
        basic.showIcon(IconNames.No)
    }
})
let currentIndex = 0
let IMGMode = true
let ImageList: string[] = []
let StringList: string[] = []
let rawData = ""
MFRC522.Init()
basic.showIcon(IconNames.SmallDiamond)

basic.forever(function () 
{
    
    if (MFRC522.RequestStatus(0x26) == 0) 
    {
        rawData=""
        rawData = MFRC522.read()
        serial.writeLine(rawData)
        if (rawData.length > 0) 
        {
            loadingdata()
            // resets the stored data on micrbit to the newest NFC tag
            StringList = []
            ImageList = []
            currentIndex = 0
            let imagePosition = 0
            let stringPosition =0 
            
            serial.writeLine("Current string position is " + stringPosition)
            while (rawData.indexOf("IMG", imagePosition) != -1) 
            {
                // the datablock of image
                let found = rawData.indexOf("IMG", imagePosition)
                if (found != -1) 
                {
                    let marker = rawData.indexOf("en", found)
                    if (marker != -1) 
                    {
                        serial.writeLine("found an IMG datablock")
                        let dataStart = marker + 2
                        ImageList.push(rawData.substr(dataStart, 25))
                        // end of datebyte, continue searching for image type
                        imagePosition = dataStart + 25
                    } else {
                        imagePosition = found + 3 //move past "IMG"
                    }
                }

            }
            while (rawData.indexOf("STRING", stringPosition) != -1)
            {
                let found2 = rawData.indexOf("STRING", stringPosition)
                let marker2 = rawData.indexOf("en", found2)

                if (marker2 != -1)
                {
                    let dataStart = marker2 + 2
                    StringList.push(rawData.substr(dataStart, 25))
                    stringPosition = dataStart + 25
                }else
                {
                    stringPosition = found2 + 6
                }

            }
            // if in imagemode, display first image data
            // if not imagemode, display strings
            // if have data in other mode, auto switch
            if (IMGMode && ImageList.length > 0) 
            {
                displayPattern(ImageList[0])
            } else if (!(IMGMode) && StringList.length > 0) 
            {
                displaystring(StringList[0])
                serial.writeLine("Displayed String 0")
            } else if (ImageList.length > 0)
            {
                IMGMode = !IMGMode
                displayPattern(ImageList[0])
            } else if (StringList.length > 0)
            {
                IMGMode = !IMGMode
                displayPattern(StringList[0])
            }
        }
        rawData = ""
    }
    basic.pause(500)
})
