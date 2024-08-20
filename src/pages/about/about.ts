import { registerTab } from "../../components/events/events"
import { registerSystemColorSchemeWatcher, updateTheme, updateThemeStyle } from "../../theme"
import { Message, Messages } from "../../types/messages"
import { Theme } from "../../types/option-types"

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
    if (message.action === Messages.RUMBLE_THEME_CHANGED_TAB) {
        updateThemeStyle(message.data.theme as Theme)
    }
    sendResponse({ done: true })
})

/**
 * Initialize the page
 */
const populateView = async (): Promise<void> => {
    registerSystemColorSchemeWatcher()
    await updateTheme()
}

populateView().then()

registerTab()
