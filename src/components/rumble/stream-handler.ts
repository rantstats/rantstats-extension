import { cacheStream } from "../../cache"
import { CONSTS } from "../../types/consts"
import { RumbleEventBase, RumbleEventInit, RumbleEventMessages, RumbleEventType } from "../../types/rumble-types"
import { setupPopup } from "../popup/popup"
import { initEventHandler } from "../rants/handler-init"
import { messagesEventHandler } from "../rants/handler-message"

/**
 * Initialize the stream data in the storage
 * @param videoId id of video
 */
export const initStreamCache = (videoId: string): void => {
    let creator = ""
    let creatorUrl = ""
    const creatorHeadings = document.getElementsByClassName("media-heading-name") as HTMLCollectionOf<HTMLSpanElement>
    if (creatorHeadings.length === 1) {
        const creatorHeading = creatorHeadings[0]
        creator = creatorHeading.textContent
        const creatorA = creatorHeading.parentNode as HTMLAnchorElement
        creatorUrl = creatorA.href
        if (creatorUrl === undefined) {
            creatorUrl = ""
        }
    }

    let { title } = document
    if (title.startsWith("Chat: ")) {
        title = title.substring(6)
    }

    const popup = setupPopup(videoId)
    if (!popup) {
        cacheStream({
            videoId,
            title,
            creator,
            time: new Date().toISOString(),
            url: `${window.location.origin}${window.location.pathname}`,
            creatorUrl,
            rants: [],
        }).then()
    }
}

/**
 * Handle stream message event
 * @param event message event
 * @param videoId id of video
 */
export const messageHandler = (event: MessageEvent, videoId: string): void => {
    const errorMessageElement = document.getElementById(CONSTS.ERROR_ID) as HTMLDivElement
    errorMessageElement.classList.add(CONSTS.HIDDEN_CLASS)

    try {
        const { data } = event
        const eventData = JSON.parse(data) as RumbleEventBase

        switch (eventData.type) {
            case RumbleEventType.init:
                initEventHandler(eventData as RumbleEventInit, videoId)
                break
            case RumbleEventType.messages:
                messagesEventHandler(eventData as RumbleEventMessages, videoId)
                break
            case RumbleEventType.mute_users:
                // TODO: restore message in chat (if configured)
                break
            case RumbleEventType.delete_non_rant_messages:
                // TODO: restore message in chat (if configured)
                break
            default:
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                if (DEBUG) console.error("Unknown event type", eventData)
        }
    } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (DEBUG) {
            console.error("Error parsing message:")
            console.error(e)
        }
    }
}
