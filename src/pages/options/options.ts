import {cleanHistory, getOptions, getUsage} from "../../cache";
import {optionsSaved, registerTab, triggerOpenRantsPage} from "../../events";
import {registerThemeWatcher, updateTheme, updateThemeStyle} from "../../theme";
import {BYTES_USE_ID} from "../../types/consts";
import {Message, Messages} from "../../types/messages";
import {defaultOptions, Options, Theme} from "../../types/option-types";

const sortOrderSelect = document.getElementById('sort-order') as HTMLSelectElement
// const cacheCheckbox = document.getElementById('cache') as HTMLInputElement
// const syncCheckbox = document.getElementById('sync') as HTMLInputElement
const historyInput = document.getElementById('history') as HTMLInputElement
const themeSelect = document.getElementById('theme') as HTMLSelectElement
const openLocationCheckbox = document.getElementById('open-location') as HTMLInputElement
const bytesUseSpan = document.getElementById(BYTES_USE_ID) as HTMLSpanElement
// const bytesTotalSpan = document.getElementById(BYTES_TOTAL_ID) as HTMLSpanElement
// const bytesPercentageSpan = document.getElementById(BYTES_PERCENTAGE_ID) as HTMLSpanElement

chrome.runtime.onMessage.addListener(
        (message: Message, sender, sendResponse) => {
            switch (message.action) {
                case Messages.RUMBLE_THEME_CHANGED_TAB:
                    updateThemeStyle(message.data.theme as Theme)
                    break
                default:
                    break
            }
            sendResponse({done: true})
        }
)

/**
 * Update the extension usage fields in the HTML
 */
const updateUsage = () => {
    getUsage()
            .then((usage) => {
                bytesUseSpan.textContent = usage.inUse.toLocaleString()
                // bytesTotalSpan.textContent = usage.total.toLocaleString()
                // bytesPercentageSpan.textContent = `${usage.percentage.toFixed(2)}%`
            })
}

/**
 * Update the HTML elements for changing the options
 *
 * @param options option values
 */
const setOptions = (options: Options) => {
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
const setDefault = () => {
    setOptions(defaultOptions)
}

/**
 * Save the option values from the HTML elements to storage
 */
const saveOptions = () => {
    const currentOptions: Options = {
        sortOrder: sortOrderSelect.value,
        // cache: cacheCheckbox.checked,
        // sync: syncCheckbox.checked,
        historyDays: parseInt(historyInput.value),
        theme: themeSelect.value,
        asPopup: openLocationCheckbox.checked,
    }

    chrome.storage.local.set({
        options: currentOptions
    })
            .then(() => {
                const status = document.getElementById('save-status') as HTMLParagraphElement
                status.textContent = 'Options saved'
                setTimeout(
                        () => {
                            status.textContent = ''
                        },
                        750
                )
            })

    // push changes to open pages
    optionsSaved(currentOptions)
}

/**
 * Load options from storage and update HTML
 */
const loadOptions = () => {
    if (location.hash === '#popup') {
        document.documentElement.classList.add('popup')
    }

    registerThemeWatcher()
    updateTheme().then()

    // run clean history at the beginning of each load
    cleanHistory().then()

    getOptions(defaultOptions)
            .then((options) => {
                setOptions(options)
            })
}

/**
 * Clear all stored data (after confirmation)
 */
const clearOptions = () => {
    const clear = confirm("Clear all saved data? Any previously cached Rants will be lost and option will be restored to default")

    if (!clear)
        return

    // clear all options
    chrome.storage.local.clear()
            .then(() => {
                const status = document.getElementById('clear-status') as HTMLParagraphElement
                status.textContent = 'Saved data cleared'
                setDefault()
                setTimeout(
                        () => {
                            status.textContent = ''
                        },
                        750
                )
            })

}

registerTab()

document.addEventListener('DOMContentLoaded', loadOptions)
document.getElementById('save').addEventListener('click', saveOptions)
document.getElementById('clear').addEventListener('click', clearOptions)

document.getElementById('open-rants').addEventListener("click", triggerOpenRantsPage)
