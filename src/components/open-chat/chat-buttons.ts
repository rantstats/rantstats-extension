import { CONSTS } from "../../types/consts"

/**
 * Helper for getting the chat button element
 * @returns chat button elements
 */
export const getChatButtons = (): Array<HTMLParagraphElement> => {
    return Array.from(document.getElementsByClassName(CONSTS.CHAT_BUTTON_ID) as HTMLCollectionOf<HTMLParagraphElement>)
}

/**
 * Set the chat button enable/disable state
 * @param enabled true: enable button
 */
export const setChatButtonEnable = (enabled: boolean): void => {
    const chatButtons = getChatButtons()
    chatButtons.forEach((chatButton) => {
        if (enabled) {
            chatButton.classList.remove("disabled")
        } else {
            chatButton.classList.add("disabled")
        }
    })
}
