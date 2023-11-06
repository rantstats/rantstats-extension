import mutedWords from "./muteWords.txt"

let runMutedWordChecker = true
let runMutedWordCheckerInChat = true
let runMutedWordCheckerInRantStats = true
let mutedWordRegEx: RegExp = null

/**
 * Get whether the muted word checker should be run or not
 * @returns run muted word checker
 */
export const getRunMutedWordChecker = (): boolean => {
    return runMutedWordChecker
}

/**
 * Set the muted words
 *
 * Sets the value returned by {@link getRunMutedWordChecker} to true if `runCheck` is true and at least one word in `word`
 * @param runCheck should muted word check run or not
 * @param words list of muted words
 * @param muteInChat should chat messages and Rumble Rants in chat be muted
 * @param muteInRantStats should Rumble Rants in Rant Stats sidebar/popout be muted
 */
export const setMutedWords = (
    runCheck: boolean,
    words: Array<string>,
    muteInChat: boolean = true,
    muteInRantStats: boolean = true,
): void => {
    runMutedWordChecker = false // assume disabled
    runMutedWordCheckerInChat = muteInChat
    runMutedWordCheckerInRantStats = muteInRantStats

    if (runCheck) {
        const cleanWords: Set<string> = new Set<string>()
        words.forEach((word) => {
            if (word.trim() !== "" && word.trimStart()[0] !== "#") {
                const idx = word.indexOf("#")
                if (idx >= 0) {
                    cleanWords.add(word.substring(0, idx).trim())
                } else {
                    cleanWords.add(word)
                }
            }
        })

        if (cleanWords.size > 0) {
            const wordFilter = Array.from(cleanWords).join("|")
            mutedWordRegEx = new RegExp(`\\b(${wordFilter})\\b`, "imu")
            runMutedWordChecker = muteInChat || muteInRantStats
        }
    }
}

/**
 * Get the list of default words to mute
 * @returns list of default words
 */
export const getDefaultMutedWords = (): Array<string> => {
    return mutedWords.split(/\r?\n/)
}

/**
 * Check if any of the muted words were found in the text
 * @param text The text to search for words in
 * @returns Indicate if muted word found
 */
const mutedWordInText = (text: string): boolean => {
    if (mutedWordRegEx === null) return false
    return mutedWordRegEx.test(text)
}

/**
 * Checks to see if button has already been added to node.
 * @param node node to check if parent has a button
 * @returns true if button already exists
 */
const hasButton = (node: HTMLElement): boolean => {
    const buttonNodes = node.parentElement.querySelectorAll(".show-muted-text-button")
    return buttonNodes.length > 0
}

/**
 * Add button to show/hide the textNode
 * @param textNode The node to show/hide. Button will be added before this node.
 * @param buttonTitle Tooltip text for button
 * @param buttonTextToShow Text to show on button when textNode is hidden
 * @param buttonTextToHide Text to show on button when textNode is visible
 */
export const addButtonToggle = (
    textNode: HTMLElement,
    buttonTitle: string = "",
    buttonTextToShow: string = "Show muted text",
    buttonTextToHide: string = "Hide muted text",
): void => {
    if (hasButton(textNode)) {
        return
    }

    const showButton = document.createElement("button")
    showButton.classList.add("show-muted-text-button")
    showButton.textContent = buttonTextToShow
    showButton.title = buttonTitle
    textNode.parentElement.insertBefore(showButton, textNode)

    /**
     * When clicked, hide self and show hidden text
     * @param ev event
     */
    showButton.onclick = (ev): void => {
        if (textNode.classList.contains("hidden")) {
            textNode.classList.remove("hidden")
            showButton.textContent = buttonTextToHide
        } else {
            textNode.classList.add("hidden")
            showButton.textContent = buttonTextToShow
        }
        ev.stopImmediatePropagation()
    }
}

/**
 * Add mute button if text should be muted
 *
 * Press button to reveal muted text. Press again to hide text.
 *
 * Hover over button to reveal text without showing it in the page.
 * @param node root node containing message/rant data
 * @param textNodeSelector name of node containing text
 * @param text The text to search for words in
 * @param chat Indicates if source is from chat.
 */
export const addMutedButton = (node: HTMLElement, textNodeSelector: string, text: string, chat: boolean): void => {
    // don't check if type should not be filtered
    if (chat) {
        if (!runMutedWordCheckerInChat) {
            return
        }
    } else if (!runMutedWordCheckerInRantStats) {
        return
    }

    if (mutedWordInText(text)) {
        node.classList.add("muted-chat")
        const textNode: HTMLElement = node.querySelector(textNodeSelector)
        textNode.classList.add("hidden")
        addButtonToggle(textNode, text)
    }
}

/**
 * Mute chat if muted word found in message
 * @param node received chat node
 */
export const checkForMutedWordsChat = (node: HTMLLIElement): void => {
    if (!runMutedWordChecker) return

    let text = "" // get message text

    // check if Rant message
    let selector = ".chat-history--rant-text"
    const rantText = node.querySelector(selector)
    if (rantText !== null) {
        text = rantText.textContent
    }

    // check if normal chat
    const message = node.querySelector(".chat-history--message")
    if (message !== null) {
        selector = ".chat-history--message"
        text = message.textContent
    }

    // exit if no text found
    if (text === "") return

    addMutedButton(node, selector, text, true)
}
