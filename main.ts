let currentImageIndex = 0
let currentStringIndex = 0
let currentIndex = 0
let IMGMode = true
let ImageList: string[] = []
let StringList: string[] = []
let rawData = ""
let cardExist = false
let displayChange = false


function cleanString(payload: string): string 
{
    let result = ""
    let spaceCount = 0

    // trim the start and end if there are spaces
    let start = 0
    while (start < payload.length && payload.charAt(start) == " ") 
    {
        start += 1
    }
    let end = payload.length - 1
    while (end >= start && payload.charAt(end) == " ") 
    {
        end -= 1
    }

    for (let i = start; i <= end; i++) 
    {
        let character = payload.charAt(i)

        if (character == " ") 
        {
            spaceCount += 1
        } else 
        {
            if (spaceCount >= 3) 
            {
                result += " "
            } else 
            {
                for (let j = 0; j < spaceCount; j++) 
                {
                    result += " "
                }
            }
            spaceCount = 0
            result += character
        }
    }

    // handle spaces at very end of trimmed region if needed
    if (spaceCount >= 3) {
        result += " "
    } else {
        for (let j = 0; j < spaceCount; j++) {
            result += " "
        }
    }

    return result
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

function displayString(payload: string) 
{
    let myToken = displayChange
    basic.clearScreen()

    for (let i = 0; i < payload.length; i++) 
    {
        if (myToken != displayChange) 
        {
            return
        }

        basic.showString(payload.charAt(i), 80)

        if (myToken != displayChange) 
        {
            return
        }
    }
    basic.clearScreen()
    basic.showIcon(IconNames.Yes)
}

function displayPattern(payload: string) 
{
    let myToken = displayChange
    if (myToken != displayChange) 
    {
        return
    }

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

    basic.clearScreen()
    basic.showIcon(IconNames.Yes)
}

function showCurrentItem() 
{
    let activeList = IMGMode ? ImageList : StringList
    let index = IMGMode ? currentImageIndex : currentStringIndex

    if (activeList.length <= 0) 
    {
        basic.showIcon(IconNames.No)
        return
    }

    if (index >= activeList.length) 
    {
        index = 0
        if (IMGMode) 
        {
            currentImageIndex = 0
        } else 
        {
            currentStringIndex = 0
        }
    }

    if (index < 0)
    {
        index = activeList.length - 1
        if (IMGMode) 
        {
            currentImageIndex = activeList.length - 1
        } else 
        {
            currentStringIndex = activeList.length - 1
        }
    }

    displayChange = !displayChange
    let myToken = displayChange

    control.inBackground(function () 
    {
        basic.showNumber((index + 1), 100)

        if (myToken != displayChange) {
            return
        }

        if (IMGMode) 
        {
            displayPattern(activeList[index])
        } else 
        {
            displayString(activeList[index])
        }
    })
}

function moveCurrentIndex(step: number) 
{
    let activeList = IMGMode ? ImageList : StringList

    if (activeList.length <= 0) 
    {
        basic.showIcon(IconNames.No)
        return
    }

    let index = IMGMode ? currentImageIndex : currentStringIndex
    index += step

    if (index >= activeList.length) 
    {
        index = 0
    }

    if (index < 0) 
    {
        index = activeList.length - 1
    }

    if (IMGMode) 
    {
        currentImageIndex = index
    } else 
    {
        currentStringIndex = index
    }
    showCurrentItem()
}

input.onButtonPressed(Button.A, function () 
{
    moveCurrentIndex(-1)
})

input.onButtonPressed(Button.B, function () 
{
    moveCurrentIndex(1)
})

input.onButtonPressed(Button.AB, function () 
{
    IMGMode = !IMGMode

    if (IMGMode) 
    {
        basic.showString("I")
    } else 
    {
        basic.showString("S")
    }
    showCurrentItem()
})

MFRC522.Init()
basic.showIcon(IconNames.SmallDiamond)

basic.forever(function () 
{
    
    if (MFRC522.RequestStatus(0x26) == 0) 
    {
        if (!cardExist)
        {
            cardExist = true
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
                
                /*
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
                */
                while (true) 
                {
                    let found2 = rawData.indexOf("STRING", stringPosition)
                    if (found2 == -1) break

                    let marker2 = rawData.indexOf("en", found2)
                    if (marker2 == -1) {
                        stringPosition = found2 + 6
                        continue
                    }

                    let dataStart = marker2 + 2
                    if (dataStart + 25 > rawData.length) break

                    let payload = rawData.substr(dataStart, 25)
                    payload = cleanString(payload)
                    StringList.push(payload)

                    stringPosition = dataStart + 25
                }
                while (true) {
                    let found = rawData.indexOf("IMG", imagePosition)
                    if (found == -1) break

                    let marker = rawData.indexOf("en", found)
                    if (marker == -1) {
                        imagePosition = found + 3
                        continue
                    }

                    let dataStart = marker + 2
                    if (dataStart + 25 > rawData.length) break

                    let payload = rawData.substr(dataStart, 25)

                    // optional validation: only 0/1 allowed
                    let valid = true
                    for (let i = 0; i < payload.length; i++) {
                        if (payload.charAt(i) != "0" && payload.charAt(i) != "1") {
                            valid = false
                            break
                        }
                    }

                    if (valid) {
                        ImageList.push(payload)
                    }

                    imagePosition = dataStart + 25
                }
                // if in imagemode, display first image data
                // if not imagemode, display strings
                // if have data in other mode, auto switch
                if (IMGMode && ImageList.length > 0) 
                {
                    displayPattern(ImageList[0])
                } else if (!(IMGMode) && StringList.length > 0) 
                {
                    displayString(StringList[0])
                    serial.writeLine("Displayed String 0")
                } else if (ImageList.length > 0)
                {
                    IMGMode = !IMGMode
                    displayPattern(ImageList[0])
                } else if (StringList.length > 0)
                {
                    IMGMode = false
                    displayString(StringList[0])
                }
            }
        }
    } else 
    {
        cardExist = false
    }
    basic.pause(500)
})
