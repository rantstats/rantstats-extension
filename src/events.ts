import {handleUpdateOptions} from "./messages";
import {Message, Messages} from "./types/messages";
import {Options, Theme} from "./types/option-types";

/**
 * Helper for sending message to background
 *
 * @param action message type to send
 * @param data data to send. Format depends on Message
 */
const sendAction = (
        action: Messages,
        data: { [key: string]: any } = undefined
) => {
    chrome.runtime.sendMessage({
        'action': action,
        'data': data,
    } as Message)
            .then()
}

/**
 * Send Message to open extension options page
 */
export const triggerOpenOptionsPage = () => {
    sendAction(Messages.OPEN_OPTIONS)
}

/**
 * Send Message to open rants viewer page
 */
export const triggerOpenRantsPage = () => {
    sendAction(Messages.OPEN_RANTS)
}

/**
 * Send Message with updated Options
 *
 * @param options updated option values
 */
export const optionsSaved = (options: Options) => {
    sendAction(Messages.OPTIONS_SAVED, options)
    handleUpdateOptions(options)
}

/**
 * Send Message with updated Theme
 *
 * @param theme updated theme value
 */
export const rumbleThemeChanged = (theme: Theme) => {
    sendAction(Messages.RUMBLE_THEME_CHANGED, {theme: theme})
}

/**
 * Send Message indicating page opened
 *
 * @param tabUrl page URL
 */
const pageLoaded = (tabUrl: string) => {
    sendAction(Messages.PAGE_LOADED, {tab: tabUrl})
}

/**
 * Send Message indicating page is closing
 *
 * @param tabUrl page URL
 */
const pageUnloaded = (tabUrl: string) => {
    sendAction(Messages.PAGE_UNLOADED, {tab: tabUrl})
}

/**
 * Register a new page that may want to receive messages
 */
export const registerTab = () => {
    const currentTabUrl = location.href
    pageLoaded(currentTabUrl)
    window.addEventListener('beforeunload', () => {
        pageUnloaded(currentTabUrl)
    })
}
