import { CONSTS } from "./types/consts"

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
