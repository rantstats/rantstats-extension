import { openRantsButtonHandler } from "./components/open-chat/open-chat"
import { getVideoID } from "./components/rumble/rumble"

/**
 * Open sidebar
 */
export const openSidebar = (): void => {
    const videoId = getVideoID()
    if (videoId === "") {
        return
    }

    const chatHistory = document.getElementsByClassName("chat-history")
    if (chatHistory.length === 0) {
        // eslint-disable-next-line no-alert
        window.alert("Video is not a live stream or no chat history. No Rants to show.")
        return // not a live feed
    }

    openRantsButtonHandler(videoId).then()
}
