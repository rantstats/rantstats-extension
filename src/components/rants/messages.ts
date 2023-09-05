import { RumbleMessage, RumbleUser } from "../../types/rumble-types"

import { renderMessage } from "./rant"

/**
 * Parse message received from Rumble
 * @param message received message
 * @param user cached user data for user who sent message
 * @param videoId id of video
 * @param userBadges map of user id to badges for user
 */
const parseMessage = (
    message: RumbleMessage,
    user: RumbleUser,
    videoId: string,
    userBadges: Map<string, Array<string>>,
): void => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { id, time, user_id, text, rant, notification } = message
    const badges = userBadges.get(user.id)
    // render rants and notifications
    if (rant || notification) {
        renderMessage(
            videoId,
            id,
            time,
            user_id,
            text,
            rant,
            notification,
            user.username,
            user["image.1"],
            badges,
        ).then(() => {})
    }
}

/**
 * Parse messages received from Rumble
 * @param messages list of received message
 * @param users list of cached users
 * @param videoId id of video
 * @param userBadges map of user id to badges for user
 */
export const parseMessages = (
    messages: Array<RumbleMessage>,
    users: Array<RumbleUser>,
    videoId: string,
    userBadges: Map<string, Array<string>>,
): void => {
    messages.forEach((message: RumbleMessage) => {
        const user = users.find((u) => u.id === message.user_id)
        parseMessage(message, user, videoId, userBadges)
    })
}
