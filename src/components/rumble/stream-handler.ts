import {cacheStream, getStream} from "../../cache";
import {ERROR_ID, HIDDEN_CLASS, POPUP_CLASS, SIDEBAR_ID, SIDEBAR_TITLE_ID} from "../../types/consts";
import {RumbleEventBase, RumbleEventInit, RumbleEventMessages, RumbleEventType} from "../../types/rumble-types";
import {displayCachedRants, initEventHandler, messagesEventHandler, parseLevels} from "../rants/rants";

/**
 * Chat message stream
 */
let _activeEventSource: EventSource = null

/**
 * Start chat message stream for video
 *
 * @param videoId id of video
 */
export const startStream = (videoId: string) => {
    const eventSource = new EventSource(
            `https://web7.rumble.com/chat/api/chat/${videoId}/stream`,
            {
                withCredentials: true,
            }
    )
    _activeEventSource = eventSource
    eventSource.onopen = (event: Event) => {
        openHandler(event, videoId)
    }
    eventSource.onerror = (event: Event) => {
        errorHandler(event, videoId)
    }
    eventSource.onmessage = (event: MessageEvent) => {
        messageHandler(event, videoId)
    }

    // close handler
    window.addEventListener('beforeunload', () => {
        stopStream()
    })
}

/**
 * Stop chat message stream watcher
 */
export const stopStream = () => {
    if (_activeEventSource !== null) {
        try {
            _activeEventSource.close()
        } catch {
        }
    }
}

/**
 * Check if stream has been started
 */
export const activeStream = (): boolean => {
    return _activeEventSource !== null
}

/**
 * Setup page if viewed in popup
 *
 * @param videoId id of video
 * @return true: opened in popup
 */
const setupPopup = (videoId: string): boolean => {
    const sidebar = document.getElementById(SIDEBAR_ID) as HTMLHeadingElement
    if (sidebar === null) {
        return false
    }
    const popup = sidebar.classList.contains(POPUP_CLASS)

    if (popup) {
        document.documentElement.style.overflow = 'hidden'
        const sidebarTitleHeader = document.getElementById(SIDEBAR_TITLE_ID) as HTMLHeadingElement
        if (sidebarTitleHeader) {
            getStream(videoId)
                    .then((streamData) => {
                        if (streamData.title) {
                            sidebarTitleHeader.textContent = streamData.title
                        } else {
                            sidebarTitleHeader.textContent = 'Rant Stats'
                        }
                    })
        }
    }

    return popup
}

/**
 * Initialize the stream data in the storage
 *
 * @param videoId id of video
 */
export const initStreamCache = (videoId: string) => {
    let creator = ''
    let creatorUrl = ''
    const creatorHeadings = document.getElementsByClassName('media-heading-name') as HTMLCollectionOf<HTMLSpanElement>
    if (creatorHeadings.length === 1) {
        const creatorHeading = creatorHeadings[0]
        creator = creatorHeading.textContent
        const creatorA = creatorHeading.parentNode as HTMLAnchorElement
        creatorUrl = creatorA.href
        if (creatorUrl === undefined) {
            creatorUrl = ''
        }
    }

    let title = document.title
    if (title.startsWith('Chat: ')){
        title = title.substring(6)
    }

    const popup = setupPopup(videoId)
    if (!popup) {
        cacheStream({
            videoId: videoId,
            title: title,
            creator: creator,
            time: new Date().toISOString(),
            url: `${location.origin}${location.pathname}`,
            creatorUrl: creatorUrl,
            rants: [],
        })
                .then()
    }
}

/**
 * Handle stream open event
 *
 * @param event open event
 * @param videoId id of video
 */
const openHandler = (event: Event, videoId: string) => {
    setupPopup(videoId)
}

/**
 * Handle stream error event
 *
 * @param event error event
 * @param videoId id of video
 */
const errorHandler = (event: Event, videoId: string) => {
    const errorMessageElement = document.getElementById(ERROR_ID) as HTMLDivElement
    errorMessageElement.classList.remove(HIDDEN_CLASS)
    setupForDisplayingCached(videoId)
}

/**
 * Setup display for displaying cached data.
 *
 * Useful when error occurs in EventSource or loading cached data during replay
 *
 * @param videoId id of video
 */
export const setupForDisplayingCached = (videoId: string) => {
    setupPopup(videoId)

    parseLevels([], true)
    displayCachedRants(videoId)
}

/**
 * Handle stream message event
 *
 * @param event message event
 * @param videoId id of video
 */
const messageHandler = (event: MessageEvent, videoId: string) => {
    const errorMessageElement = document.getElementById(ERROR_ID) as HTMLDivElement
    errorMessageElement.classList.add(HIDDEN_CLASS)

    try {
        const data = event.data
        const eventData = JSON.parse(data) as RumbleEventBase

        switch (eventData.type) {
            case RumbleEventType.init:
                initEventHandler(eventData as RumbleEventInit, videoId)
                break
            case RumbleEventType.messages:
                messagesEventHandler(eventData as RumbleEventMessages, videoId)
                break
            default:
                console.error("Unknown event type", eventData)
        }
    } catch (e) {
        console.error('Error parsing message:')
        console.error(e)
    }
}
