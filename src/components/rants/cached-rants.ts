import { getAllCachedMessages } from "../../cache"
import { CachedRant } from "../../types/cache"
import { CONSTS } from "../../types/consts"
import { RumbleRant } from "../../types/rumble-types"
import { setupPopup } from "../popup/popup"

import { parseLevels } from "./levels"
import { renderMessage } from "./rant"

/**
 * Determine if cached messages should be shown
 * @param numRants number of rants in cache
 * @param activeStream there is an active Event Stream
 */
const showCacheMessage = (numRants: number, activeStream: boolean = true): void => {
    if (!activeStream && window.location.host === "rumble.com") {
        const cacheMessageP = document.getElementById(CONSTS.CACHE_MESSAGE_ID) as HTMLParagraphElement
        const cacheMessageCount = document.getElementById(CONSTS.CACHE_MESSAGE_COUNT_ID) as HTMLSpanElement
        cacheMessageCount.textContent = `${numRants}`
        cacheMessageP.classList.remove("hidden")
    }
}

/**
 * Display all cached rant
 * @param videoId id of video
 * @param activeStream there is an active Event Stream
 * @param cachePage true: open in extension cache page rather than sidebar
 */
export const displayCachedRants = (videoId: string, activeStream: boolean, cachePage: boolean = false): void => {
    getAllCachedMessages(videoId)
        .then((cachedRants: Array<CachedRant>) => {
            cachedRants.forEach((value) => {
                renderMessage(
                    videoId,
                    value.id,
                    value.time,
                    value.user_id,
                    value.text,
                    value.rant as RumbleRant,
                    value.notification,
                    value.username,
                    undefined,
                    value.badges,
                    true,
                    value.read,
                    cachePage,
                ).then()
            })
            return cachedRants.length
        })
        .then((numRants) => {
            showCacheMessage(numRants, activeStream)
        })
}

/**
 * Setup display for displaying cached data.
 *
 * Useful when error occurs in EventSource or loading cached data during replay
 * @param videoId id of video
 * @param activeStream there is an active Event Stream
 */
export const setupForDisplayingCached = (videoId: string, activeStream: boolean = true): void => {
    setupPopup(videoId)

    parseLevels([], true)
    displayCachedRants(videoId, activeStream)
}
