import {RANT_LIST_ID, SIDEBAR_ID} from "./types/consts";

/**
 * Get the video ID from one of the possible page elements
 *
 * @return video id
 */
export const getVideoIdFromDiv = (): string => {
    let videoIdDiv = document.getElementById(SIDEBAR_ID) as HTMLDivElement
    if (videoIdDiv === null) {
        videoIdDiv = document.getElementById(RANT_LIST_ID) as HTMLDivElement
    }
    let videoId = videoIdDiv.getAttribute('data-video-id')
    if (videoId === "-1") {
        videoId = null
    }

    return videoId
}
