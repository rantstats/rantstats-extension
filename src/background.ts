import { Message, Messages } from "./types/messages"
import { Options, Theme } from "./types/option-types"

const openTabs: Map<number, chrome.tabs.Tab> = new Map<number, chrome.tabs.Tab>()

/**
 * Handle receiving message {@link Messages.OPEN_OPTIONS}.
 *
 * Opens extension options in new tab.
 */
const handleOpenOptionsPage = (): void => {
    chrome.runtime.openOptionsPage()
}

/**
 * Handle receiving message {@link Messages.OPEN_RANTS}
 *
 * Opens cached rants viewer page
 */
const handleOpenRantsPage = (): void => {
    chrome.tabs.create(
        {
            url: "pages/rants/rants.html",
        },
        () => {},
    )
}

/**
 * Handle receiving message {@link Messages.PAGE_LOADED}
 *
 * Registers tab open at URL
 * @param tabUrl the URL of the tab that was opened
 */
const handlePageLoaded = (tabUrl: string): void => {
    chrome.tabs.query({ url: tabUrl }, (tabs) => {
        tabs.forEach((tab) => {
            try {
                openTabs.set(tab.id, tab)
            } catch (e) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                // eslint-disable-next-line no-console
                if (DEBUG) console.log(`error adding tab: ${tab.url}`)
            }
        })
    })
}

/**
 * Handle receiving message {@link Messages.PAGE_UNLOADED}
 *
 * Removes previously registered tab
 * @param tabUrl the URL of the tab that is being closed
 */
const handlePageUnloaded = (tabUrl: string): void => {
    chrome.tabs.query({ url: tabUrl }, (tabs) => {
        tabs.forEach((tab) => {
            openTabs.delete(tab.id)
        })
    })
}

/**
 * Handle receiving message {@link Messages.OPTIONS_SAVED}
 *
 * Sends message to all registered tabs with updated options
 * @param options updated option values
 */
const handleUpdateOptions = (options: Options): void => {
    openTabs.forEach((tab) => {
        chrome.tabs.sendMessage(
            tab.id,
            {
                action: Messages.OPTIONS_SAVED_TAB,
                data: { options },
            },
            {},
            () => {
                if (chrome.runtime.lastError) {
                    // console.log("update options error", chrome.runtime.lastError, "for tab", tab)
                    // if unable to send message, assume closed, stop tracking
                    openTabs.delete(tab.id)
                }
            },
        )
    })
}

/**
 * Handle receiving message {@link Messages.RUMBLE_THEME_CHANGED}
 *
 * Sends message to all registered tabs with updated theme preference
 * @param theme new Theme to use
 */
const handleRumbleThemeChanged = (theme: Theme): void => {
    openTabs.forEach((tab) => {
        chrome.tabs.sendMessage(
            tab.id,
            {
                action: Messages.RUMBLE_THEME_CHANGED_TAB,
                data: { theme },
            },
            {},
            () => {
                if (chrome.runtime.lastError) {
                    // console.log("update theme error", chrome.runtime.lastError, "for tab", tab)
                    // if unable to send message, assume closed, stop tracking
                    openTabs.delete(tab.id)
                }
            },
        )
    })
}

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
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
            handlePageLoaded(message.data.tab as string)
            break
        case Messages.PAGE_UNLOADED:
            handlePageUnloaded(message.data.tab as string)
            break
        case Messages.RUMBLE_THEME_CHANGED:
            handleRumbleThemeChanged(message.data.theme as Theme)
            break
        default:
            break
    }
    sendResponse({ done: true })
})
