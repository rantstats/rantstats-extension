import { consoleError } from "../../log"
import { RumbleEventMessages, RumbleEventType } from "../../types/rumble-types"

import { parseMessages } from "./messages"
import { parseUsers } from "./users"

/**
 * Handle chat stream {@link RumbleEventType.messages} message
 * @param eventData received messages message data
 * @param videoId id of video
 */
export const messagesEventHandler = (eventData: RumbleEventMessages, videoId: string): void => {
    const { type } = eventData
    if (type !== RumbleEventType.messages) {
        consoleError(`Invalid event type passed to messages event handler: ${type}`)
        return
    }

    const { data } = eventData

    const userBadges = parseUsers(data.users)
    parseMessages(data.messages, data.users, videoId, userBadges)
}
