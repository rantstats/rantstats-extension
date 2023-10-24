import { consoleError } from "../../log"
import { RumbleEventMuteUsers, RumbleEventType } from "../../types/rumble-types"
import { addButtonToggle } from "../chat-watcher/muted-words"

/**
 * Mute the specified user
 *
 * Marks chat messages from this user as deleted
 * @param user id of user
 */
const muteUser = (user: string): void => {
    const userChats: NodeListOf<HTMLLIElement> = document.querySelectorAll(`[data-message-user-id='${user}']`)

    userChats.forEach((chatElement) => {
        chatElement.classList.add("muted-user")

        const savedText = chatElement.getAttribute("data-message")
        if (savedText !== "") {
            // get the message node
            const messageElement: HTMLDivElement = chatElement.querySelector(".chat-history--message")
            // add button
            addButtonToggle(messageElement, savedText, "Show removed message", "Hide removed message")
            // replace node with saved text
            messageElement.textContent = savedText
        }
    })
}

/**
 * Handle chat stream {@link RumbleEventType.mute_users} message
 * @param eventData received mute users data
 */
export const muteEventHandler = (eventData: RumbleEventMuteUsers): void => {
    const { type } = eventData
    if (type !== RumbleEventType.mute_users) {
        consoleError(`Invalid event type passed to mute users event handler: ${type}`)
        return
    }

    const { data } = eventData

    data?.user_ids.forEach((user_id) => {
        muteUser(user_id)
    })
}
