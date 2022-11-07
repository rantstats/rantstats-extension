import {getTheme} from "./cache";
import {rumbleThemeChanged} from "./events";
import {CHAT_BUTTON_ID, RUMBLE_DARK_CSS, SIDEBAR_ID} from "./types/consts";
import {Theme} from "./types/option-types";

/**
 * Register watcher of the operating system color scheme.
 *
 * Will update theme of data to match OS preference.
 */
export const registerThemeWatcher = () => {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        const newTheme = event.matches ? Theme.Dark : Theme.Light
        updateThemeStyle(newTheme)
    })
}

/**
 * Set the theme class on the specified HTML element to match theme preference.
 *
 * - {@link Theme.Light}: 'theme-light'
 * - {@link Theme.Dark}: 'theme-dark'
 *
 * @param elm HTML element to set class on
 * @param themePreference theme preference
 */
const setThemeClass = (elm: HTMLElement, themePreference: Theme) => {
    if (elm) {
        const newTheme = `theme-${themePreference === Theme.Light ? "light" : "dark"}`
        elm.classList.remove("theme-dark", "theme-light")
        elm.classList.add(newTheme)
    }
}

/**
 * Update the theme class on the chat elements
 */
export const updateChatThemeStyle = () => {
    const chatDiv = document.getElementById('chat-history-list') as HTMLDivElement
    if (chatDiv !== null) {
        const themePreference = getRumbleTheme()
        setThemeClass(chatDiv, themePreference)
    }

    const chatButton = document.getElementById(CHAT_BUTTON_ID) as HTMLParagraphElement
    if (chatButton !== null) {
        const themePreference = getRumbleTheme()
        setThemeClass(chatButton, themePreference)
    }
}

/**
 * Update the data to match the theme preference
 *
 * @param themePreference new theme value
 */
export const updateThemeStyle = (themePreference: Theme) => {
    const sidebarDiv = document.getElementById(SIDEBAR_ID) as HTMLDivElement

    if (themePreference == Theme.Rumble) {
        themePreference = getRumbleTheme()
    }

    setThemeClass(sidebarDiv, themePreference)
    updateChatThemeStyle()

    const pageHtml = document.documentElement
    if (pageHtml.classList.contains('rantstats')) {
        setThemeClass(pageHtml, themePreference)
    }
}

/**
 * Helper for getting the desired Theme based on the Rumble theme preference
 *
 * @return Rumble theme value
 */
export const getRumbleTheme = (): Theme => {
    let themePreference
    if (location.host === 'rumble.com') {
        const darkStyle = document.querySelector(`[${RUMBLE_DARK_CSS}]`) as HTMLLinkElement
        if (darkStyle === null) {
            // fall back to light mode
            themePreference = Theme.Light
        } else if (darkStyle.disabled) {
            themePreference = Theme.Light
        } else {
            themePreference = Theme.Dark
        }
    } else {
        // not on rumble so fall back to system
        themePreference = Theme.System
    }
    return themePreference
}

/**
 * Update the theme used
 */
export const updateTheme = async () => {
    let themePreference = Theme.System
    const themeSetting = await getTheme()
    const savedThemeSetting = themeSetting
    switch (themeSetting) {
        case Theme.Rumble:
            // check if on rumble, if so, get theme
            themePreference = getRumbleTheme()
            break
        case Theme.System:
        case Theme.Dark:
        case Theme.Light:
            themePreference = themeSetting
            break
    }

    if (themePreference == Theme.System) {
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            themePreference = Theme.Dark
        } else {
            themePreference = Theme.Light
        }
    }

    updateThemeStyle(themePreference)

    if (savedThemeSetting == Theme.Rumble) {
        rumbleThemeChanged(themePreference)
    }
}

/**
 * Handle changes made to the Rumble.com head.
 *
 * Used to catch changes to the Rumble theme
 *
 * @param mutations list of mutations
 * @param observer reference to the observer
 */
const headObserverCallback = (mutations: Array<MutationRecord>, observer: MutationObserver) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node: HTMLElement) => {
                if (node !== undefined && node.attributes !== undefined) {
                    if (RUMBLE_DARK_CSS in node.attributes) {
                        updateTheme().then()
                    }
                }
            })
        } else if (mutation.type === 'attributes') {
            const target = mutation.target as HTMLElement
            if (RUMBLE_DARK_CSS in target.attributes) {
                updateTheme().then()
            }
        }
    })
}
// setup observer to watch for changes to Rumble.com <head>. Used to catch theme changes
const headObserver = new MutationObserver(headObserverCallback)
headObserver.observe(document.head, {childList: true, attributes: true, subtree: true})
