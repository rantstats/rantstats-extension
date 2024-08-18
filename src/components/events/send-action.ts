import { Message, Messages } from "../../types/messages"

/**
 * Helper for sending message to background
 * @param action message type to send
 * @param data data to send. Format depends on Message
 */
export const sendAction = (
    action: Messages,
    data: {
        [key: string]: unknown
    } = undefined,
): void => {
    chrome.runtime.sendMessage(
        {
            action,
            data,
        } as Message,
        () => {
            if (chrome.runtime.lastError) {
                // consoleLog("action error", chrome.runtime.lastError)
            }
        },
    )
}
