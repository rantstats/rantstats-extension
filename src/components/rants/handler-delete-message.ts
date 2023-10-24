import { consoleError } from "../../log"
import { RumbleDeleteNonRantMessages, RumbleEventType } from "../../types/rumble-types"
import { getPreserveMessageData } from "../chat-watcher/chat-watcher"
import { addButtonToggle } from "../chat-watcher/muted-words"

/**
 * Delete specified chat
 *
 * Mark chat message deleted
 * @param message_id the message id
 */
const deleteMessage = (message_id: string): void => {
    const messageIds: NodeListOf<HTMLLIElement> = document.querySelectorAll(`[data-message-id='${message_id}']`)

    messageIds.forEach((chatElement) => {
        chatElement.classList.add("deleted-chat")

        const savedText = chatElement.getAttribute("data-message")
        if (savedText !== "") {
            // get the message node
            const messageElement: HTMLDivElement = chatElement.querySelector(".chat-history--message")
            // add button
            addButtonToggle(messageElement, savedText, "Show deleted message", "Hide deleted message")
            // replace node with saved text
            messageElement.textContent = savedText
        }
    })
}
/**
 * Handle chat stream {@link RumbleEventType.delete_non_rant_messages} message
 * @param eventData received deleted user data
 */
export const deleteMessageEventHandler = (eventData: RumbleDeleteNonRantMessages): void => {
    const { type } = eventData
    if (type !== RumbleEventType.delete_non_rant_messages) {
        consoleError(`Invalid event type passed to delete user event handler: ${type}`)
        return
    }
    // if message data was not saved, skip
    if (!getPreserveMessageData()) {
        return
    }

    const { data } = eventData

    data?.message_ids.forEach((message_id) => {
        deleteMessage(message_id)
    })
}
