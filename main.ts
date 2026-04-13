let currentImageIndex = 0
let currentStringIndex = 0
let IMGMode = true
let ImageList: string[] = []
let StringList: string[] = []
let rawData = ""
let displayChange = false
let scanArmed = false
let displayPending = false
let displayRequestId = 0
let stringPosition = 0
let imagePosition = 0

// visual image to tell user the NFC card is reading
function loadingdata() {
    basic.clearScreen()

    basic.showLeds(`
        # # # # #
        # . . . #
        # . . . #
        # . . . #
        # # # # #
    `)
    basic.pause(200)

    basic.showLeds(`
        . . . . .
        . # # # .
        . # . # .
        . # # # .
        . . . . .
    `)
    basic.pause(200)

    basic.showLeds(`
        . . . . .
        . . . . .
        . . # . .
        . . . . .
        . . . . .
    `)
    basic.pause(200)

    basic.clearScreen()
    basic.showIcon(IconNames.Yes)
}

function cleanString(payload: string): string {
    let result = ""
    let spaceCount = 0

    // trim the start and end if there are spaces
    let start = 0
    while (start < payload.length && payload.charAt(start) == " ") {
        start += 1
    }
    let end = payload.length - 1
    while (end >= start && payload.charAt(end) == " ") {
        end -= 1
    }

    for (let i = start; i <= end; i++) {
        let character = payload.charAt(i)

        if (character == " ") {
            spaceCount += 1
        } else {
            if (spaceCount >= 3) {
                result += " "
            } else {
                for (let j = 0; j < spaceCount; j++) {
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




function displayString(payload: string) {
    let myToken = displayChange
    basic.clearScreen()

    for (let i = 0; i < payload.length; i++) {
        if (myToken != displayChange) {
            return
        }

        basic.showString(payload.charAt(i), 80)

        if (myToken != displayChange) {
            return
        }
    }
    basic.clearScreen()
    basic.showIcon(IconNames.Yes)
}

function displayPattern(payload: string) {
    let myToken = displayChange
    if (myToken != displayChange) {
        return
    }

    basic.clearScreen()
    for (let i = 0; i <= 24; i++) {
        if (payload.charAt(i) == "1") {
            let x = i % 5
            let y = Math.idiv(i, 5)
            led.plot(x, y)
        }
    }
}

function showCurrentItem() {
    let activeList = IMGMode ? ImageList : StringList
    let index = IMGMode ? currentImageIndex : currentStringIndex

    if (activeList.length <= 0) {
        basic.showIcon(IconNames.No)
        return
    }

    if (index >= activeList.length) {
        index = 0
        if (IMGMode) {
            currentImageIndex = 0
        } else {
            currentStringIndex = 0
        }
    }

    if (index < 0) {
        index = activeList.length - 1
        if (IMGMode) {
            currentImageIndex = activeList.length - 1
        } else {
            currentStringIndex = activeList.length - 1
        }
    }

    let myTokenLocal = displayChange

    basic.showNumber(index + 1, 100)

    if (myTokenLocal != displayChange) {
        return
    }

    if (IMGMode) {
        displayPattern(activeList[index])
    } else {
        displayString(activeList[index])
    }
}

function scheduleDisplay() {
    let myRequest = 0

    displayChange = !displayChange
    displayPending = true
    displayRequestId += 1
    myRequest = displayRequestId

    control.inBackground(function () {
        basic.pause(400)

        if (myRequest != displayRequestId) {
            return
        }

        displayPending = false
        showCurrentItem()
    })
}


function moveCurrentIndex(step: number) {
    let activeList = IMGMode ? ImageList : StringList

    if (activeList.length <= 0) {
        basic.showIcon(IconNames.No)
        return
    }

    let index = IMGMode ? currentImageIndex : currentStringIndex
    index += step

    if (index >= activeList.length) {
        index = 0
    }

    if (index < 0) {
        index = activeList.length - 1
    }

    if (IMGMode) {
        currentImageIndex = index
    } else {
        currentStringIndex = index
    }
    scheduleDisplay()
}

input.onButtonPressed(Button.A, function () {
    scanArmed = true
    basic.clearScreen()
    basic.showString("S")
})

input.onButtonPressed(Button.B, function () {
    moveCurrentIndex(1)
})

input.onButtonPressed(Button.AB, function () {
    IMGMode = !IMGMode

    if (IMGMode) {
        basic.showString("I")
    } else {
        basic.showString("S")
    }
    scheduleDisplay()
})

input.onGesture(Gesture.Shake, function () {

})

MFRC522.Init()
basic.showIcon(IconNames.SmallDiamond)

basic.forever(function () {

    if (scanArmed) //if scan enabled
    {
        scanArmed = false

        rawData = ""
        rawData = MFRC522.read()

        if (rawData.length > 0) {
            loadingdata()
            serial.writeLine(rawData)
            // resets the stored data on micrbit to the newest NFC tag
            StringList = []
            ImageList = []
            currentImageIndex = 0
            currentStringIndex = 0
            imagePosition = 0
            stringPosition = 0
        }

        while (true) {
            let found2 = rawData.indexOf("SDATA", stringPosition)
            if (found2 == -1) break

            let marker2 = rawData.indexOf("en", found2)
            if (marker2 == -1 || marker2 <= found2 || marker2 - found2 > 12) {
                stringPosition = found2 + 5
                continue
            }

            let dataStart = marker2 + 2
            if (dataStart + 25 > rawData.length) break

            let payload = rawData.substr(dataStart, 25)
            payload = cleanString(payload)
            if (payload.length > 0) {
                StringList.push(payload)
            }

            stringPosition = dataStart + 25
        }
        while (true) {
            let found = rawData.indexOf("IDATA", imagePosition)
            if (found == -1) break

            let marker = rawData.indexOf("en", found)
            if (marker == -1 || marker <= found || marker - found > 12) {
                imagePosition = found + 5
                continue
            }

            let dataStart = marker + 2
            if (dataStart + 25 > rawData.length) break

            let payload = rawData.substr(dataStart, 25)

            ImageList.push(payload)

            imagePosition = dataStart + 25
        }
        // if in imagemode, display first image data
        // if not imagemode, display strings
        // if have data in other mode, auto switch
        if (IMGMode && ImageList.length > 0) {
            displayPattern(ImageList[0])
        } else if (!(IMGMode) && StringList.length > 0) {
            displayString(StringList[0])
            serial.writeLine("Displayed String 0")
        } else if (ImageList.length > 0) {
            IMGMode = true
            displayPattern(ImageList[0])
            serial.writeLine("Displayed Image 0")
        } else if (StringList.length > 0) {
            IMGMode = false
            displayString(StringList[0])
        }
    }
    basic.pause(1000)
})
