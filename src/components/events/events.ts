import { handleUpdateOptions } from "../../message-options"
import { Messages } from "../../types/messages"
import { Options } from "../../types/option-types"

import { sendAction } from "./send-action"

/**
 * Send Message to open extension options page
 */
export const triggerOpenOptionsPage = (): void => {
    sendAction(Messages.OPEN_OPTIONS)
}

/**
 * Send Message to open rants viewer page
 */
export const triggerOpenRantsPage = (): void => {
    sendAction(Messages.OPEN_RANTS)
}

/**
 * Send Message with updated Options
 * @param options updated option values
 */
export const optionsSaved = (options: Options): void => {
    sendAction(Messages.OPTIONS_SAVED, options)
    handleUpdateOptions(options)
}

/**
 * Send Message indicating page opened
 * @param tabUrl page URL
 */
const pageLoaded = (tabUrl: string): void => {
    sendAction(Messages.PAGE_LOADED, { tab: tabUrl })
}

/**
 * Send Message indicating page is closing
 * @param tabUrl page URL
 */
const pageUnloaded = (tabUrl: string): void => {
    sendAction(Messages.PAGE_UNLOADED, { tab: tabUrl })
}

/**
 * Register a new page that may want to receive messages
 */
export const registerTab = (): void => {
    const currentTabUrl = window.location.href
    pageLoaded(currentTabUrl)
    window.addEventListener("beforeunload", () => {
        pageUnloaded(currentTabUrl)
    })
}
