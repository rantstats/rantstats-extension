import { CONSTS } from "../../types/consts"

/**
 * Helper for getting the chat button element
 * @returns chat button elements
 */
export const getChatButtons = (): Array<HTMLParagraphElement> => {
    return Array.from(document.getElementsByClassName(CONSTS.CHAT_BUTTON_ID) as HTMLCollectionOf<HTMLParagraphElement>)
}

/**
 * Enable the chat button
 */
export const enableChatButtons = (): void => {
    const chatButtons = getChatButtons()
    chatButtons.forEach((chatButton) => {
        chatButton.classList.remove("disabled")
    })
}

/**
 * Disable the chat button
 */
export const disableChatButtons = (): void => {
    const chatButtons = getChatButtons()
    chatButtons.forEach((chatButton) => {
        chatButton.classList.add("disabled")
    })
}
