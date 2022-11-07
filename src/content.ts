import {cleanHistory, getAllVideoIs, getSortOrder} from "./cache";
import {addCacheButton, addChatButton, openRantsButtonHandler} from "./components/open-chat/open-chat";
import {setLastSortOrder} from "./components/rants/rant";
import {getVideoID} from "./components/rumble/rumble";
import {registerTab} from "./events";
import {handleUpdateOptions} from "./messages";
import {replacePageContent} from "./rantstatspage";
import {registerThemeWatcher, updateChatThemeStyle, updateThemeStyle} from "./theme";
import {Message, Messages} from "./types/messages";
import {Theme} from "./types/option-types";

chrome.runtime.onMessage.addListener(
        /**
         * Register extension messaging listener
         *
         * @param message received Message
         */
        (message: Message) => {
            switch (message.action) {
                case Messages.OPTIONS_SAVED_TAB:
                    handleUpdateOptions(message.data.options)
                    break
                case Messages.RUMBLE_THEME_CHANGED_TAB:
                    updateThemeStyle(message.data.theme as Theme)
                    break
                default:
                    break
            }
        }
)

registerThemeWatcher()
updateChatThemeStyle()

// run clean history at the beginning of each load
cleanHistory().then()

/**
 * Add elements to the page
 */
const addElements = async () => {
    setLastSortOrder(await getSortOrder())

    if (location.pathname.startsWith('/_rantstats')) {
        if (!await replacePageContent()) {
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
addElements()
        .then(() => {
            console.log('Rant Stats Extension loaded')
        })

registerTab()
