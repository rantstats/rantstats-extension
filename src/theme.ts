import { getTheme } from "./cache"
import { getChatButtons } from "./components/open-chat/chat-buttons"
import { rumbleThemeChanged } from "./components/events/event-rumble-theme-changed"
import { CONSTS } from "./types/consts"
import { Theme } from "./types/option-types"

/**
 * Helper for getting the desired Theme based on the Rumble theme preference
 * @returns Rumble theme value
 */
export const getRumbleTheme = (): Theme => {
    if (window.location.host === "rumble.com") {
        const darkStyle = document.documentElement.classList.contains("dark")
        if (darkStyle) {
            return Theme.Dark
        }
        return Theme.Light
    }
    // not on rumble so fall back to system
    return Theme.System
}

/**
 * Set the theme class on the specified HTML element to match theme preference.
 *
 * - {@link Theme.Light}: 'theme-light'
 * - {@link Theme.Dark}: 'theme-dark'
 * @param elm HTML element to set class on
 * @param themePreference theme preference
 */
const setThemeClass = (elm: HTMLElement, themePreference: Theme): void => {
    if (elm) {
        const newTheme = `theme-${themePreference === Theme.Light ? "light" : "dark"}`
        elm.classList.remove("theme-dark", "theme-light")
        elm.classList.add(newTheme)
    }
}

/**
 * Update the theme class on the chat elements
 */
export const updateChatThemeStyle = (): void => {
    const chatDiv = document.getElementById("chat-history-list") as HTMLDivElement
    if (chatDiv !== null) {
        const themePreference = getRumbleTheme()
        setThemeClass(chatDiv, themePreference)
    }

    const chatButtons = getChatButtons()
    chatButtons.forEach((chatButton) => {
        const themePreference = getRumbleTheme()
        setThemeClass(chatButton, themePreference)
    })
}

/**
 * Update the data to match the theme preference
 * @param themePreference new theme value
 */
export const updateThemeStyle = (themePreference: Theme): void => {
    let realThemePreference = themePreference
    if (realThemePreference === Theme.Rumble) {
        realThemePreference = getRumbleTheme()
    }

    const sidebarDiv = document.getElementById(CONSTS.SIDEBAR_ID) as HTMLDivElement
    if (sidebarDiv) {
        setThemeClass(sidebarDiv, realThemePreference)
    }

    updateChatThemeStyle()

    const pageHtml = document.documentElement
    // noinspection SpellCheckingInspection
    if (pageHtml.classList.contains("rantstats")) {
        setThemeClass(pageHtml, realThemePreference)
    }
}

/**
 * Register watcher of the operating system color scheme.
 *
 * Will update theme of data to match OS preference.
 */
export const registerSystemColorSchemeWatcher = (): void => {
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (event) => {
        const newTheme = event.matches ? Theme.Dark : Theme.Light
        updateThemeStyle(newTheme)
    })
}

/**
 * Update the theme used
 */
export const updateTheme = async (): Promise<void> => {
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
        default:
            break
    }

    if (themePreference === Theme.System) {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            themePreference = Theme.Dark
        } else {
            themePreference = Theme.Light
        }
    }

    updateThemeStyle(themePreference)

    if (savedThemeSetting === Theme.Rumble) {
        rumbleThemeChanged(themePreference)
    }
}

/**
 * Handle changes made to the Rumble.com head.
 *
 * Used to catch changes to the Rumble theme
 * @param mutations list of mutations
 */
const headObserverCallback = (mutations: Array<MutationRecord>): void => {
    mutations.forEach((mutation) => {
        if (mutation.type === "attributes" && mutation.attributeName === "class") {
            updateTheme().then()
        }
    })
}

/**
 * Register observer for detecting the Rumble theme
 */
export const registerRumbleThemeObserver = (): void => {
    const headObserver = new MutationObserver(headObserverCallback)
    headObserver.observe(document.documentElement, { childList: false, attributes: true, subtree: false })
}
