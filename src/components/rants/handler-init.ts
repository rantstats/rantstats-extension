import { saveBadges } from "../../cache"
import { CacheBadge } from "../../types/cache"
import { RantsConfig, RumbleBadge, RumbleConfig, RumbleEventInit, RumbleEventType } from "../../types/rumble-types"

import { displayCachedRants } from "./cached-rants"
import { parseLevels } from "./levels"
import { parseMessages } from "./messages"
import { parseUsers } from "./users"

/**
 * Parse the badge definitions and store in cache
 * @param badges received badge definition data
 */
const parseBadgeDefinitions = (badges: { [key: string]: RumbleBadge }): void => {
    const cacheBadges: Array<CacheBadge> = new Array<CacheBadge>()

    if (badges === undefined) {
        return
    }

    Object.keys(badges).forEach((name) => {
        const { icons, label } = badges[name]

        // use the icon with the biggest size
        const iconSize = 0
        let icon = ""
        Object.keys(icons).forEach((iconKey) => {
            const iconKeyValue = parseInt(iconKey, 10)
            if (iconKeyValue > iconSize) {
                icon = icons[iconKey]
            }
        })
        // if no valid icon found, skip
        if (icon !== "") {
            let labelText = label.en
            if (labelText === undefined) {
                labelText = label[Object.keys(label)[0]]
            }

            cacheBadges.push({
                name,
                icon,
                label: labelText,
            })
        }
    })

    saveBadges(cacheBadges).then()
}

/**
 * Parse rant data from received message
 * @param rants received rant data
 */
const parseRants = (rants: RantsConfig): void => {
    const { levels } = rants
    if (levels === null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-console
        if (DEBUG) console.log("Invalid rants config, no levels", levels)
        return
    }
    parseLevels(levels)
}

/**
 * Parse config data from received message
 * @param config received config data
 */
const parseConfig = (config: RumbleConfig): void => {
    const { rants, badges } = config

    parseBadgeDefinitions(badges)

    if (rants === null) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        // eslint-disable-next-line no-console
        if (DEBUG) console.log("Invalid Rumble config, no rants", config)
        return
    }
    parseRants(rants)
}

/**
 * Handle chat stream {@link RumbleEventType.init} message
 * @param eventData received init message data
 * @param videoId id of video
 */
export const initEventHandler = (eventData: RumbleEventInit, videoId: string): void => {
    const { type } = eventData
    if (type !== RumbleEventType.init) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (DEBUG) console.error(`Invalid event type passed to init event handler: ${type}`)
        return
    }

    const { data } = eventData

    parseConfig(data.config)
    const userBadges = parseUsers(data.users)
    displayCachedRants(videoId, true)
    parseMessages(data.messages, data.users, videoId, userBadges)
}
