import { CONSTS } from "../../types/consts"
import { setupPopup } from "../popup/popup"
import { setupForDisplayingCached } from "../rants/cached-rants"

import { messageHandler } from "./stream-handler"

/**
 * Chat message stream
 */
let activeEventSource: EventSource = null

/**
 * Handle stream error event
 * @param _event error event
 * @param videoId id of video
 */
export const errorHandler = (_event: Event, videoId: string): void => {
    const errorMessageElement = document.getElementById(CONSTS.ERROR_ID) as HTMLDivElement
    errorMessageElement.classList.remove(CONSTS.HIDDEN_CLASS)
    setupForDisplayingCached(videoId, false)
}

/**
 * Handle stream open event
 * @param _event open event
 * @param videoId id of video
 */
export const openHandler = (_event: Event, videoId: string): void => {
    setupPopup(videoId)
}

/**
 * Stop chat message stream watcher
 */
export const stopStream = (): void => {
    if (activeEventSource !== null) {
        try {
            activeEventSource.close()
        } catch {
            /* empty */
        }
    }
}

/**
 * Start chat message stream for video
 * @param videoId id of video
 */
export const startStream = (videoId: string): void => {
    const eventSource = new EventSource(`https://web7.rumble.com/chat/api/chat/${videoId}/stream`, {
        withCredentials: true,
    })
    activeEventSource = eventSource
    /**
     * Handle open stream event
     * @param event the event
     */
    eventSource.onopen = (event: Event): void => {
        openHandler(event, videoId)
    }
    /**
     * Handle error event
     * @param event the event
     */
    eventSource.onerror = (event: Event): void => {
        errorHandler(event, videoId)
    }
    /**
     * Handle message event
     * @param event the event
     */
    eventSource.onmessage = (event: MessageEvent): void => {
        messageHandler(event, videoId)
    }

    window.addEventListener("beforeunload", () => {
        stopStream()
    })
}
