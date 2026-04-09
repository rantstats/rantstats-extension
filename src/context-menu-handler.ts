import { getAllVideoIs } from "./cache"
import { openRantsButtonHandler } from "./components/open-chat/open-chat"
import { getVideoID } from "./components/rumble/rumble"

/**
 * Open sidebar
 */
export const openSidebar = async (): Promise<void> => {
    const videoId = getVideoID()
    if (videoId === "") {
        return
    }

    const cachedVideoIds = await getAllVideoIs()
    const validVideoId = cachedVideoIds.includes(videoId)

    if (!validVideoId) {
        window.alert("Video is not a live stream or no chat history. No Rants to show.")
        return // not a live feed
    }

    await openRantsButtonHandler(videoId)
}
