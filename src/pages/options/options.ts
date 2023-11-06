import { cleanHistory, getOptions, getUsage, updateOptions } from "../../cache"
import { getDefaultMutedWords } from "../../components/chat-watcher/muted-words"
import { optionsSaved, registerTab, triggerOpenRantsPage } from "../../components/events/events"
import { handleUpdateOptions } from "../../message-options"
import { registerSystemColorSchemeWatcher, updateTheme, updateThemeStyle } from "../../theme"
import { CONSTS } from "../../types/consts"
import { Message, Messages } from "../../types/messages"
import { defaultOptions, Options, Theme } from "../../types/option-types"
import { validateText } from "../../utils"

const saveButton = document.getElementById("save") as HTMLButtonElement
const sortOrderSelect = document.getElementById("sort-order") as HTMLSelectElement
const historyInput = document.getElementById("history") as HTMLInputElement
const themeSelect = document.getElementById("theme") as HTMLSelectElement
const openLocationCheckbox = document.getElementById("open-location") as HTMLInputElement
const bytesUseSpan = document.getElementById(CONSTS.BYTES_USE_ID) as HTMLSpanElement
const showDeletedChatsCheckbox = document.getElementById("show-mute-users") as HTMLInputElement
const showMutedUsersCheckbox = document.getElementById("show-delete-chats") as HTMLInputElement
const alternateColorsCheckbox = document.getElementById("alternate-colors") as HTMLInputElement
const hideMutedWordsCheckbox = document.getElementById("hide-muted-words") as HTMLInputElement
const customMutedWordsTextArea = document.getElementById("custom-muted-words") as HTMLTextAreaElement
const importMutedWordsButton = document.getElementById("import-muted-words") as HTMLButtonElement
const muteInChatCheckbox = document.getElementById("mute-in-chat") as HTMLInputElement
const muteInRantStatsCheckbox = document.getElementById("mute-in-rant-stats") as HTMLInputElement

// temporary options before saving
let tempOptions: Options = null

/**
 * Set whether the save button should be active or not
 * @param enabled enable or disable save button
 */
const setSaveButtonState = (enabled: boolean): void => {
    const title = enabled ? "" : "No changes since last save"
    saveButton.disabled = !enabled
    saveButton.title = title
}

/**
 * Toggle showing or hiding the sub-options section based on the check state
 * @param checkbox The checkbox to check the state of
 */
const hideShowSubOptions = (checkbox: HTMLInputElement): void => {
    const subOptionsDiv: HTMLDivElement =
        checkbox.parentElement.parentElement.parentElement.querySelector(".sub-options")
    if (checkbox.checked) {
        subOptionsDiv.classList.add("visible")
    } else {
        subOptionsDiv.classList.remove("visible")
    }
}

/**
 * Update the extension usage fields in the HTML
 */
const updateUsage = (): void => {
    getUsage().then((usage) => {
        bytesUseSpan.textContent = usage.inUse.toLocaleString()
    })
}

/**
 * Update the HTML elements for changing the options
 * @param options option values
 */
const setOptions = (options: Options): void => {
    sortOrderSelect.value = options.sortOrder
    historyInput.value = options.historyDays.toString()
    themeSelect.value = options.theme.toString()
    openLocationCheckbox.checked = options.asPopup
    showDeletedChatsCheckbox.checked = options.showDeletedChats
    showMutedUsersCheckbox.checked = options.showMutedUsers
    alternateColorsCheckbox.checked = options.alternateColors
    hideMutedWordsCheckbox.checked = options.hideMutedWords
    hideShowSubOptions(hideMutedWordsCheckbox)
    customMutedWordsTextArea.value = options.customMutedWords.join("\n")
    muteInChatCheckbox.checked = options.muteInChat
    muteInRantStatsCheckbox.checked = options.muteInRantStats

    tempOptions = options

    updateUsage()
}

/**
 * Get all current option values
 * @returns the options
 */
const getCurrentOptions = (): Options => {
    return {
        sortOrder: sortOrderSelect.value,
        historyDays: parseInt(historyInput.value, 10),
        theme: themeSelect.value,
        asPopup: openLocationCheckbox.checked,
        showDeletedChats: showDeletedChatsCheckbox.checked,
        showMutedUsers: showMutedUsersCheckbox.checked,
        alternateColors: alternateColorsCheckbox.checked,
        hideMutedWords: hideMutedWordsCheckbox.checked,
        customMutedWords: validateText(customMutedWordsTextArea.value).split("\n"),
        muteInChat: muteInChatCheckbox.checked,
        muteInRantStats: muteInRantStatsCheckbox.checked,
    }
}

/**
 * Check if 2 sets of Options match
 * @param options1 option 1 values
 * @param options2 option 2 values
 * @returns options match
 */
const doOptionsMatch = (options1: Options, options2: Options): boolean => {
    let match = true
    Object.entries(options1).forEach((entry1) => {
        const key = entry1[0]
        const value1 = entry1[1]
        const value2 = options2[key]
        let valuesMatch = value1 === value2
        if (key === "customMutedWords") {
            const value1Array = value1 as Array<string>
            value1Array.sort()
            const value2Array = value2 as Array<string>
            value2Array.sort()
            valuesMatch = JSON.stringify(value1Array) === JSON.stringify(value2Array)
        }
        match = match && valuesMatch
    })
    return match
}

/**
 * Handle element change event
 */
const optionChanged = (): void => {
    const currentOptions = getCurrentOptions()
    const optionsMatch = doOptionsMatch(currentOptions, tempOptions)
    setSaveButtonState(!optionsMatch)
}

/**
 * Set the options to the default values
 */
const setDefault = (): void => {
    setOptions(defaultOptions)
    setSaveButtonState(false)
}

/**
 * Save the option values from the HTML elements to storage
 */
const saveOptions = (): void => {
    const currentOptions = getCurrentOptions()
    customMutedWordsTextArea.value = currentOptions.customMutedWords.join("\n")

    updateOptions(currentOptions).then(() => {
        const status = document.getElementById("save-status") as HTMLParagraphElement
        tempOptions = currentOptions
        status.textContent = "Options saved"
        setSaveButtonState(false)
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
    registerSystemColorSchemeWatcher()
    updateTheme().then()

    // run clean history at the beginning of each load
    cleanHistory().then()

    // disable save button until something changes
    setSaveButtonState(false)

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

/**
 * Append muted words to current data
 */
const importMutedWords = (): void => {
    const defaultMutedWords = getDefaultMutedWords()
    const currentDataText = customMutedWordsTextArea.value
    const currentData = currentDataText.trim() === "" ? [] : currentDataText.split("\n")

    currentData.push("# Imported word list")
    const originalLength = currentData.length
    defaultMutedWords.forEach((word) => {
        if (!currentData.includes(word)) currentData.push(word)
    })

    // remove comment if nothing imported
    if (currentData.length === originalLength) {
        currentData.pop()
        // eslint-disable-next-line no-alert
        window.alert("No new words to import")
    }

    customMutedWordsTextArea.value = currentData.join("\n")
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
saveButton.addEventListener("click", saveOptions)
sortOrderSelect.addEventListener("change", optionChanged)
historyInput.addEventListener("change", optionChanged)
historyInput.addEventListener("input", optionChanged)
themeSelect.addEventListener("change", optionChanged)
openLocationCheckbox.addEventListener("change", optionChanged)
bytesUseSpan.addEventListener("change", optionChanged)
showDeletedChatsCheckbox.addEventListener("change", optionChanged)
showMutedUsersCheckbox.addEventListener("change", optionChanged)
alternateColorsCheckbox.addEventListener("change", optionChanged)
hideMutedWordsCheckbox.addEventListener("change", optionChanged)
customMutedWordsTextArea.addEventListener("change", optionChanged)
customMutedWordsTextArea.addEventListener("input", optionChanged)
importMutedWordsButton.addEventListener("change", optionChanged)
muteInChatCheckbox.addEventListener("change", optionChanged)
muteInRantStatsCheckbox.addEventListener("change", optionChanged)
document.getElementById("clear").addEventListener("click", clearOptions)
document.getElementById("open-rants").addEventListener("click", triggerOpenRantsPage)

importMutedWordsButton.addEventListener("click", importMutedWords)

document.querySelectorAll(".has-sub-options").forEach((optionDiv: HTMLDivElement) => {
    optionDiv.querySelectorAll(".option-row .selector input").forEach((checkbox) => {
        checkbox.addEventListener("click", (evt) => {
            // const subOptionsDiv = optionDiv.querySelector(".sub-options")
            hideShowSubOptions(evt.currentTarget as HTMLInputElement)
        })
    })
})
