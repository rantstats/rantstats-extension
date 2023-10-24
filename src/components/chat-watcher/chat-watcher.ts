import { checkForMutedWordsChat } from "./muted-words"

let preserveMessageData = true

/**
 * Get whether the received chat message data should be preserved
 * @returns preserve received chats
 */
export const getPreserveMessageData = (): boolean => {
    return preserveMessageData
}

/**
 * Set whether the received chat message data should be preserved
 * Note: slightly increases memory usage
 * @param value preserve received chats
 */
export const setPreserveMessageData = (value: boolean): void => {
    preserveMessageData = value
}

/**
 * Save message data for use later
 * @param node received chat node
 */
const saveMessageData = (node: HTMLLIElement): void => {
    // const userId = node.getAttribute("data-message-user-id")
    const messageId = node.getAttribute("data-message-id")
    const message = node.querySelector(".chat-history--message")
    if (message !== null) {
        const liveChat: HTMLLIElement = document.querySelector(`[data-message-id='${messageId}']`)
        liveChat.setAttribute("data-message", message.textContent)
    }
}

/**
 * Handle new chat node received
 * @param node received chat node
 */
const newChatReceived = (node: HTMLLIElement): void => {
    if (preserveMessageData) {
        saveMessageData(node)
    }
    checkForMutedWordsChat(node)
}

/**
 * Handle changes made to the chat.
 *
 * Used to catch new chat messages
 * @param mutations list of mutations
 */
const chatObserverCallback = (mutations: Array<MutationRecord>): void => {
    mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
            // mutation.removedNodes.forEach((node: HTMLLIElement) => {
            //     consoleLog("node removed", node)
            // })
            mutation.addedNodes.forEach((node: HTMLLIElement) => newChatReceived(node))
        }
    })
}

/**
 * Register observer for catching new chat messages
 */
export const registerChatMessageObserver = (): void => {
    const chatList = document.getElementById("chat-history-list")
    if (chatList !== null) {
        const headObserver = new MutationObserver(chatObserverCallback)
        headObserver.observe(chatList, { childList: true, attributes: false, subtree: false })
    }
}
