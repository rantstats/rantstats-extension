import { cleanHistory, getAllVideoIs, getSortOrder } from "./cache"
import { addCacheButton, addChatButton, openRantsButtonHandler } from "./components/open-chat/open-chat"
import { setLastSortOrder } from "./components/rants/rant"
import { getVideoID } from "./components/rumble/rumble"
import { registerTab } from "./components/events/events"
import { handleUpdateOptions } from "./message-options"
import { replacePageContent } from "./rantstatspage"
import { registerThemeWatcher, updateChatThemeStyle, updateThemeStyle } from "./theme"
import { Message, Messages } from "./types/messages"
import { Options, Theme } from "./types/option-types"

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
    switch (message.action) {
        case Messages.OPTIONS_SAVED_TAB:
            handleUpdateOptions(message.data.options as Options)
            break
        case Messages.RUMBLE_THEME_CHANGED_TAB:
            updateThemeStyle(message.data.theme as Theme)
            break
        default:
            break
    }
    sendResponse({ done: true })
})

registerThemeWatcher()
updateChatThemeStyle()

// run clean history at the beginning of each load
cleanHistory().then()

/**
 * Add elements to the page
 */
const addElements = async (): Promise<void> => {
    setLastSortOrder(await getSortOrder())

    // noinspection SpellCheckingInspection
    if (window.location.pathname.startsWith("/_rantstats")) {
        const replaceContent = await replacePageContent()
        if (!replaceContent) {
            return
        }
    }

    const videoId = getVideoID()
    if (videoId === "") {
        return
    }

    const liveFeed = addChatButton(() => {
        openRantsButtonHandler(videoId)
    })

    const cachedVideoIds = await getAllVideoIs()
    const validVideoId = cachedVideoIds.includes(videoId)

    if (!liveFeed && validVideoId) {
        addCacheButton(() => {
            openRantsButtonHandler(videoId, true)
        })
    }
}

// add elements to page
addElements().then(() => {
    registerTab()
})
