import {CacheBadge, cacheMessage, getAllCachedMessageIds, getBadges, getUser, updateCachedMessage} from "../../cache";
import {RANT_LIST_ID, READ_CHECK, TOTAL_ID} from "../../types/consts";
import {SortOrder} from "../../types/option-types";
import {RumbleMessage, RumbleRant, RumbleUser} from "../../types/rumble-types";
import {getVideoIdFromDiv} from "../../utils";

/**
 * Rant level cutoff values where each value represents the lower value for the level
 */
let _rantLevelValues: Array<number> = []
/**
 * Local value of the sort order for the Rants.
 * Used to avoid reading value from storage every time
 */
let _lastSortOrder: SortOrder = SortOrder.OldToNew
/**
 * Local list of displayed messages
 */
const _displayedMessages: Array<string> = []

/**
 * Update the HTML representing the total amount of Rants received
 *
 * @param total new total value
 */
export const updateTotalText = (total: number) => {
    const totalParagraph = document.getElementById(TOTAL_ID) as HTMLParagraphElement
    const totalString = Number(
            total.toFixed(2)).toLocaleString(
            'en',
            {
                minimumFractionDigits: 2
            }
    )
    totalParagraph.setAttribute('data-total', totalString)
    totalParagraph.textContent = `$${totalString}`
    totalParagraph.title = `$${totalString}`

}

/**
 * Increment the total with the specified amount
 *
 * @param amount amount to increase total by
 */
const updateTotal = (amount: number) => {
    const totalParagraph = document.getElementById(TOTAL_ID) as HTMLParagraphElement
    let totalRaw = totalParagraph.getAttribute('data-total')
    let total = 0.0
    if (totalRaw !== undefined) {
        total = parseFloat(totalRaw)
    }
    total += amount

    updateTotalText(total)
}

/**
 * Setter for specifying the rant level increments
 *
 * @param newRantLevelValues list of new rant level cutoff values
 */
export const setRantLevelValues = (newRantLevelValues: Array<number>) => {
    _rantLevelValues = newRantLevelValues
}

/**
 * Setter for specifying the local sort order value
 *
 * @param sortOrder new sort order value
 */
export const setLastSortOrder = (sortOrder: SortOrder) => {
    _lastSortOrder = sortOrder
}

/**
 * Clear the displayed messages
 */
export const clearDisplayedMessages = () => {
    _displayedMessages.splice(0)
}

/**
 * Parse messages received from Rumble
 *
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
) => {
    messages.forEach((message: RumbleMessage) => {
        const user = users.find((u) => u.id === message.user_id)
        parseMessage(message, user, videoId, userBadges)
    })
}

/**
 * Parse message received from Rumble
 *
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
) => {
    const {id, time, user_id, text, rant} = message
    const badges = userBadges.get(user.id)
    // render rants
    if (rant) {
        renderMessage(videoId, id, time, user_id, text, rant, user.username, user["image.1"], badges)
                .then(() => {
                })
    }
}

/**
 * Render Rumble Rant
 *
 * @param videoId id of video
 * @param messageId id of the message
 * @param time Time message was posted
 * @param userId id of user who made message
 * @param text text of the message
 * @param rant paid Rumble Rant data
 * @param username Username for user
 * @param userImage Optional path to profile image
 * @param badges badges for user
 * @param cached true: rendering a previously cached message
 * @param read true: message should be marked read
 * @param cachePage true: data being displayed on cache page
 */
export const renderMessage = async (
        videoId: string,
        messageId: string,
        time: string,
        userId: string,
        text: string,
        rant: RumbleRant = undefined,
        username: string = undefined,
        userImage: string = undefined,
        badges: Array<string> = undefined,
        cached: boolean = false,
        read: boolean = false,
        cachePage: boolean = false
) => {
    // skip if message already shown
    if (_displayedMessages.includes(messageId)) {
        return
    }

    if (username === undefined || userImage === undefined || username === userId) {
        const userDetails = await getUserDetails(userId, username, userImage)
        username = userDetails.username
        userImage = userDetails.userImage
    }

    if (!cached) {
        // don't cache if already cached
        const cachedVideoIds = await getAllCachedMessageIds(videoId)
        if (cachedVideoIds.includes(messageId)) {
            return
        }

        cacheMessage(
                videoId,
                {
                    id: messageId,
                    time: time,
                    user_id: userId,
                    text: text,
                    username: username,
                    rant: {
                        price_cents: rant.price_cents,
                    },
                    badges: badges,
                    read: read
                }
        )
                .then()
    }

    if (rant) {
        await renderRant(messageId, time, text, rant, username, userImage, badges, read, cachePage)
    }
}

const renderRant = async (
        messageId: string,
        time: string,
        text: string,
        rant: RumbleRant,
        username: string,
        userImage: string,
        badges: Array<string> = undefined,
        read: boolean = false,
        cachePage: boolean = false
) => {
    const {rantHTML, rantLevel, amount} = getRantHTML(rant, messageId, read)
    const userImageHTML = getUserImageHtml(userImage, username, messageId)
    const badgesHTML = await getBadgesHtml(badges)

    const chatDate = new Date(time)
    const isoDate = chatDate.toISOString()

    const chatDiv = document.createElement('div') as HTMLDivElement
    chatDiv.classList.add('external-chat')
    if (read) {
        chatDiv.classList.add('read')
    }
    chatDiv.setAttribute('data-level', rantLevel)
    chatDiv.setAttribute('data-chat-id', messageId)
    chatDiv.setAttribute('data-date', isoDate)
    chatDiv.setAttribute('data-amount', amount.toString())

    let html: string
    if (cachePage) {
        html = `
            ${rantHTML}
            <div class="rant-data">
                <div class="user-image">${userImageHTML}</div>
        
                <div class="rant-details">
                    <div class="user-info">
                        <p class="username">${username}</p>
                        <time class="timestamp" datatype="${isoDate}">${chatDate.toLocaleDateString()}
                            ${chatDate.toLocaleTimeString()}
                        </time>
                    </div>

                    <p class="chat-text">${text}</p>
                </div>
            </div>
        `
    } else {
        html = `
            ${rantHTML}
            <div class="user-info">
                <div class="user-image">${userImageHTML}</div>
                <p class="username">${username}</p>
                ${badgesHTML}
                <time class="timestamp" datatype="${isoDate}">${chatDate.toLocaleDateString()}
                    ${chatDate.toLocaleTimeString()}
                </time>
            </div>
            <p class="chat-text">${text}</p>
        `
    }
    chatDiv.innerHTML = html

    addChat(chatDiv, messageId)

    const userImageElement = document.getElementById(`img-${messageId}`) as HTMLImageElement
    if (userImageElement)
        userImageElement.addEventListener('error', imageErrorHandler)

    updateTotal(amount)
}

/**
 * Get the user details from the cached user data
 *
 * @param user_id user id to get data for
 * @param username username (if known)
 * @param userImage path to profile image (if known)
 * @return updated user details
 */
const getUserDetails = async (
        user_id: string,
        username: string = undefined,
        userImage: string = undefined
): Promise<{
    username: string,
    userImage: string,
}> => {
    const user = await getUser(user_id)
    if (user) {
        if (username === undefined) {
            username = user.username
        }
        if (userImage === undefined) {
            userImage = user.image
        }
    }

    if (username === undefined) {
        username = user_id
    }

    return {
        username,
        userImage,
    }

}

/**
 * Get HTML representing the Rumble Rant
 *
 * @param rant Rumble Rant to generate HTML for
 * @param messageId id of message
 * @param read true: message marked read
 * @return Rant Data object:
 *
 *  - rantHTML (string) html for Rumble Rant
 *  - rantLevel (string) value representing the rant level group
 *  - amount: (number) amount of Rant
 */
const getRantHTML = (rant: RumbleRant, messageId: string, read: boolean): {
    rantHTML: string,
    rantLevel: string,
    amount: number,
} => {
    if (!rant) {
        return {
            rantHTML: '',
            rantLevel: '',
            amount: 0,
        }
    }

    const price_dollars = rant.price_cents / 100
    const matchingRantLevel = getMatchingRantLevel(price_dollars)
    const rantLevel = `${matchingRantLevel}`

    // language=html
    const rantHTML = `
        <div class="rant-amount">
            <p>$${price_dollars.toFixed(2)}</p>
            <label for="${messageId}" class="show-hide-checkbox">
                Read:
                <input type="checkbox" id="${messageId}" class="${READ_CHECK}" ${read ? "checked" : ""}/>
            </label>
        </div>
    `

    return {
        rantHTML: rantHTML,
        rantLevel: rantLevel,
        amount: price_dollars,
    }
}

/**
 * Get the rant level from the Rumble Rant amount
 *
 * @param price_dollars amount of rant
 * @return rant level
 */
const getMatchingRantLevel = (price_dollars: number): number => {
    let matchingRantLevel: number = 0

    _rantLevelValues.forEach((rantLevel) => {
        if (price_dollars >= rantLevel) {
            if (matchingRantLevel > 0) {
                if (matchingRantLevel < rantLevel) {
                    matchingRantLevel = rantLevel
                }
            } else {
                matchingRantLevel = rantLevel
            }
        }
    })

    return matchingRantLevel
}

/**
 * Get HTML data for the user's profile image.
 *
 * If no profile image url, returns placeholder div
 *
 * @param userImage path to user image
 * @param username username for user
 * @param messageId id of message being added
 * @return image html
 */
const getUserImageHtml = (userImage: string, username: string, messageId: string): string => {
    if (userImage) {
        return `
            <img
                    id="img-${messageId}"
                    src="${userImage}"
                    alt="Profile picture for ${username}"
                    loading="lazy"
                    aria-hidden="true"
            />
        `
    }

    return `
        <div
                class="no-img"
                id="img-${messageId}"
                aria-hidden="true"
                data-letter="${username.substring(0, 1)}"
        ></div>
    `
}

/**
 * Get the HTML representing the badge images
 *
 * @param badges array of badge names
 * @return HTML for user's badges
 */
const getBadgesHtml = async (badges: Array<string>): Promise<string> => {
    if (badges === undefined || badges.length === 0) {
        return ''
    }

    return await getBadges()
            .then((badgeInfoMap) => {
                let badgesHtml = `<div class="user-badges">`
                badges.forEach((name) => {
                    const badgeMap = badgeInfoMap.get(name)
                    const badgeHtml = getBadgeImage(name, badgeMap, "user-badge")
                    badgesHtml = `${badgesHtml}${badgeHtml}`
                })

                badgesHtml += "</div>"
                return badgesHtml
            })
}

const getBadgeImage = (name: string, badgeData: CacheBadge, imgClass: string): string => {
    return `<img class="${imgClass}" src="https://rumble.com${badgeData.icon}" alt="${badgeData.label}" title="${badgeData.label}">`
}

/**
 * Handle issues loading image src
 *
 * @param event error event
 */
const imageErrorHandler = (event: Event) => {
    const target = event.target as HTMLImageElement
    target.style.display = 'none'
}

/**
 * Add HTML representing Rumble Rant to list and sort items
 *
 * @param chatDiv HTML element representing the Rumble Rant
 * @param messageId id of message being added
 */
const addChat = (chatDiv: HTMLDivElement, messageId: string) => {
    const chatList = document.getElementById(RANT_LIST_ID) as HTMLDivElement
    chatList.appendChild(chatDiv)
    _displayedMessages.push(messageId)

    sortChats() // TODO: for speed, may want to not call sort everytime and instead just insert in the right location
}

/**
 * Sort all rants in the list
 */
export const sortChats = () => {
    const chatList = document.getElementById(RANT_LIST_ID) as HTMLDivElement
    if (chatList === null) {
        return
    }
    const children = chatList.children

    const sorted = Array.from(children).sort((a, b) => {
                const aDate = new Date(a.getAttribute('data-date'))
                const bDate = new Date(b.getAttribute('data-date'))
                const aAmount = parseInt(a.getAttribute('data-amount'))
                const bAmount = parseInt(b.getAttribute('data-amount'))

                switch (_lastSortOrder) {
                    case SortOrder.OldToNew:
                        // @ts-ignore
                        return aDate - bDate
                    case SortOrder.NewToOld:
                        // @ts-ignore
                        return bDate - aDate
                    case SortOrder.HighToLow:
                        return bAmount - aAmount
                    case SortOrder.LowToHigh:
                        return aAmount - bAmount
                    default:
                        return 0
                }
            }
    )
    chatList.innerHTML = ''
    sorted.forEach((child) => {
        chatList.appendChild(child)
    })
}

/**
 * Toggle the 'read' state of the Rumble Rant
 *
 * @param event click event
 * @param messageId message id to toggle 'read' on
 */
const toggleRead = (event: Event, messageId: string) => {
    const videoId = getVideoIdFromDiv()
    const checkbox = event.target as HTMLInputElement

    // update value in cache
    updateCachedMessage(videoId, messageId, {read: checkbox.checked})
            .then(() => {
                const rantDiv = document.querySelector(`[data-chat-id="${messageId}"]`)
                rantDiv.classList.toggle("read")
            })
}

document.addEventListener('change', async (event) => {
    const target = event.target as HTMLElement
    if (target) {
        if (target.classList.contains(READ_CHECK)) {
            const messageId = target.id
            toggleRead(event, messageId)
        }
    }
})
