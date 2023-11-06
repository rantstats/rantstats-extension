import { consoleLog } from "./log"
import { CONSTS } from "./types/consts"

const PATTERN_LEADING_SPACE = /^[ \r\n]+/gs
const PATTERN_TRAILING_SPACE = /[ \r\n]+$/gs
const PATTERN_SPACE = /([\r\n] +| +[\r\n])/gs
const PATTERN_EMPTY_LINE = /\n{2,}/gs
const PATTERN_VALID_TEXT = /[^a-zA-Z0-9 `~!@#$%^:*\-_=+\r\n]/gs

/**
 * Get the video ID from one of the possible page elements
 * @returns video id
 */
export const getVideoIdFromDiv = (): string => {
    let videoIdDiv = document.getElementById(CONSTS.SIDEBAR_ID) as HTMLDivElement
    if (videoIdDiv === null) {
        videoIdDiv = document.getElementById(CONSTS.RANT_LIST_ID) as HTMLDivElement
    }
    let videoId = videoIdDiv.getAttribute("data-video-id")
    if (videoId === "-1") {
        videoId = null
    }

    return videoId
}

/**
 * Remove invalid characters from text
 * @param text text to clean
 * @returns cleaned text
 */
export const validateText = (text: string): string => {
    consoleLog("before", text)
    let tempText = text.replace(PATTERN_SPACE, "\n")
    tempText = tempText.replace(PATTERN_LEADING_SPACE, "")
    tempText = tempText.replace(PATTERN_TRAILING_SPACE, "")
    tempText = tempText.replace(PATTERN_EMPTY_LINE, "\n")
    consoleLog("after", tempText)
    return tempText.replace(PATTERN_VALID_TEXT, "")
}
