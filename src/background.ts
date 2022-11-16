import {Message, Messages} from "./types/messages";
import {Options, Theme} from "./types/option-types";

const _openTabs: Set<chrome.tabs.Tab> = new Set<chrome.tabs.Tab>()

chrome.runtime.onMessage.addListener(
        /**
         * Register extension messaging listener
         *
         * @param message received Message
         */
        (message: Message) => {
            switch (message.action) {
                case Messages.OPEN_OPTIONS:
                    handleOpenOptionsPage()
                    break
                case Messages.OPTIONS_SAVED:
                    handleUpdateOptions(message.data as Options)
                    break
                case Messages.OPEN_RANTS:
                    handleOpenRantsPage()
                    break
                case Messages.PAGE_LOADED:
                    handlePageLoaded(message.data.tab)
                    break
                case Messages.PAGE_UNLOADED:
                    handlePageUnloaded(message.data.tab)
                    break
                case Messages.RUMBLE_THEME_CHANGED:
                    handleRumbleThemeChanged(message.data.theme)
                    break
                default:
                    break
            }
        }
)

/**
 * Handle receiving message {@link Messages.OPEN_OPTIONS}.
 *
 * Opens extension options in new tab.
 */
const handleOpenOptionsPage = () => {
    chrome.runtime.openOptionsPage()
}

/**
 * Handle receiving message {@link Messages.OPEN_RANTS}
 *
 * Opens cached rants viewer page
 */
const handleOpenRantsPage = () => {
    chrome.tabs.create({
        url: 'pages/rants/rants.html'
    })
            .then()
            .catch()
}

/**
 * Helper for getting the {@link chrome.tabs.Tab} for the specified URL.
 *
 * @param tabUrl the tab URL to get tab of
 * @return List of tabs matching URL
 */
const getTabsFromUrl = (tabUrl: string): Promise<Array<chrome.tabs.Tab>> => {
    return chrome.tabs.query({url: tabUrl})
}

/**
 * Handle receiving message {@link Messages.PAGE_LOADED}
 *
 * Registers tab open at URL
 *
 * @param tabUrl the URL of the tab that was opened
 */
const handlePageLoaded = (tabUrl: string) => {
    getTabsFromUrl(tabUrl)
            .then((tabs) => {
                tabs.forEach((tab) => {
                    try {
                        _openTabs.add(tab)
                    } catch (e) {
                        console.log(`error sending to tab: ${tab.url}`)
                    }
                })
            })
            .catch()
}

/**
 * Handle receiving message {@link Messages.PAGE_UNLOADED}
 *
 * Removes previously registered tab
 *
 * @param tabUrl the URL of the tab that is being closed
 */
const handlePageUnloaded = (tabUrl: string) => {
    getTabsFromUrl(tabUrl)
            .then((tabs) => {
                tabs.forEach((tab) => {
                    _openTabs.delete(tab)
                })
            })
            .catch()
}

/**
 * Handle receiving message {@link Messages.OPTIONS_SAVED}
 *
 * Sends message to all registered tabs with updated options
 *
 * @param options updated option values
 */
const handleUpdateOptions = (options: Options) => {
    _openTabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
            action: Messages.OPTIONS_SAVED_TAB,
            data: {options: options}
        })
                .then()
                .catch()
    })
}

/**
 * Handle receiving message {@link Messages.RUMBLE_THEME_CHANGED}
 *
 * Sends message to all registered tabs with updated theme preference
 *
 * @param theme new Theme to use
 */
const handleRumbleThemeChanged = (theme: Theme) => {
    _openTabs.forEach((tab) => {
        chrome.tabs.sendMessage(tab.id, {
            action: Messages.RUMBLE_THEME_CHANGED_TAB,
            data: {theme: theme}
        })
                .then()
                .catch()
    })
}
