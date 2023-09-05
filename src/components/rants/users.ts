import { updateUser } from "../../cache"
import { RumbleUser } from "../../types/rumble-types"

/**
 * Parse user data from received message
 * @param users received user data
 * @returns map of user id to badges for user
 */
export const parseUsers = (users: Array<RumbleUser>): Map<string, Array<string>> => {
    const badges: Map<string, Array<string>> = new Map<string, Array<string>>()
    users.forEach((user: RumbleUser) => {
        // only save if has image
        if (user["image.1"]) {
            updateUser(user.id, {
                id: user.id,
                username: user.username,
                image: user["image.1"],
            }).then()
        }

        if (user.badges) {
            badges.set(user.id, user.badges)
        }
    })
    return badges
}
