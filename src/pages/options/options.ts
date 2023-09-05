import { cleanHistory, getOptions, getUsage, updateOptions } from "../../cache"
import { optionsSaved, registerTab, triggerOpenRantsPage } from "../../components/events/events"
import { handleUpdateOptions } from "../../message-options"
import { registerThemeWatcher, updateTheme, updateThemeStyle } from "../../theme"
import { CONSTS } from "../../types/consts"
import { Message, Messages } from "../../types/messages"
import { defaultOptions, Options, Theme } from "../../types/option-types"

const sortOrderSelect = document.getElementById("sort-order") as HTMLSelectElement
// const cacheCheckbox = document.getElementById('cache') as HTMLInputElement
// const syncCheckbox = document.getElementById('sync') as HTMLInputElement
const historyInput = document.getElementById("history") as HTMLInputElement
const themeSelect = document.getElementById("theme") as HTMLSelectElement
const openLocationCheckbox = document.getElementById("open-location") as HTMLInputElement
const bytesUseSpan = document.getElementById(CONSTS.BYTES_USE_ID) as HTMLSpanElement
// const bytesTotalSpan = document.getElementById(CONSTS.BYTES_TOTAL_ID) as HTMLSpanElement
// const bytesPercentageSpan = document.getElementById(CONSTS.BYTES_PERCENTAGE_ID) as HTMLSpanElement

/**
 * Update the extension usage fields in the HTML
 */
const updateUsage = (): void => {
    getUsage().then((usage) => {
        bytesUseSpan.textContent = usage.inUse.toLocaleString()
        // bytesTotalSpan.textContent = usage.total.toLocaleString()
        // bytesPercentageSpan.textContent = `${usage.percentage.toFixed(2)}%`
    })
}

/**
 * Update the HTML elements for changing the options
 * @param options option values
 */
const setOptions = (options: Options): void => {
    sortOrderSelect.value = options.sortOrder
    // cacheCheckbox.checked = options.cache
    // syncCheckbox.checked = options.sync
    historyInput.value = options.historyDays.toString()
    themeSelect.value = options.theme.toString()
    openLocationCheckbox.checked = options.asPopup

    updateUsage()
}

/**
 * Set the options to the default values
 */
const setDefault = (): void => {
    setOptions(defaultOptions)
}

/**
 * Save the option values from the HTML elements to storage
 */
const saveOptions = (): void => {
    const currentOptions: Options = {
        sortOrder: sortOrderSelect.value,
        // cache: cacheCheckbox.checked,
        // sync: syncCheckbox.checked,
        historyDays: parseInt(historyInput.value, 10),
        theme: themeSelect.value,
        asPopup: openLocationCheckbox.checked,
    }

    updateOptions(currentOptions).then(() => {
        const status = document.getElementById("save-status") as HTMLParagraphElement
        status.textContent = "Options saved"
        setTimeout(() => {
            status.textContent = ""
        }, 750)
    })

    // push changes to open pages
    optionsSaved(currentOptions)
}

/**
 * Load options from storage and update HTML
 */
const loadOptions = (): void => {
    if (window.location.hash === "#popup") {
        document.documentElement.classList.add("popup")
    }

    registerThemeWatcher()
    updateTheme().then()

    // run clean history at the beginning of each load
    cleanHistory().then()

    getOptions(defaultOptions).then((options) => {
        setOptions(options)
    })
}

/**
 * Clear all stored data (after confirmation)
 */
const clearOptions = (): void => {
    // eslint-disable-next-line no-alert
    const clear = window.confirm(
        "Clear all saved data? Any previously cached Rants will be lost and option will be restored to default",
    )

    if (!clear) return

    // clear all options
    chrome.storage.local.clear().then(() => {
        const status = document.getElementById("clear-status") as HTMLParagraphElement
        status.textContent = "Saved data cleared"
        setDefault()
        setTimeout(() => {
            status.textContent = ""
        }, 750)
    })
}

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
    switch (message.action) {
        case Messages.OPTIONS_SAVED_TAB:
            handleUpdateOptions(message.data.options as Options)
            setOptions(message.data.options as Options)
            break
        case Messages.RUMBLE_THEME_CHANGED_TAB:
            updateThemeStyle(message.data.theme as Theme)
            break
        default:
            break
    }
    sendResponse({ done: true })
})

registerTab()

document.addEventListener("DOMContentLoaded", loadOptions)
document.getElementById("save").addEventListener("click", saveOptions)
document.getElementById("clear").addEventListener("click", clearOptions)

document.getElementById("open-rants").addEventListener("click", triggerOpenRantsPage)
