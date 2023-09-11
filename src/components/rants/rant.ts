import { cacheMessage, getAllCachedMessageIds, getBadge, getBadges, getUser, updateCachedMessage } from "../../cache"
import { CacheBadge, Notification } from "../../types/cache"
import { CONSTS } from "../../types/consts"
import { SortOrder } from "../../types/option-types"
import { RumbleNotification, RumbleRant } from "../../types/rumble-types"
import { getVideoIdFromDiv } from "../../utils"

/**
 * Rant level cutoff values where each value represents the lower value for the level
 */
let rantLevelValues: Array<number> = []
/**
 * Local value of the sort order for the Rants.
 * Used to avoid reading value from storage every time
 */
let lastSortOrder: SortOrder = SortOrder.OldToNew
/**
 * Local list of displayed messages
 */
const displayedMessages: Array<string> = []

/**
 * Handle issues loading image src
 * @param event error event
 */
const imageErrorHandler = (event: Event): void => {
    const target = event.target as HTMLImageElement
    target.style.display = "none"
}

/**
 * Update the HTML representing the total amount of Rants received
 * @param total new total value
 */
export const updateTotalText = (total: number): void => {
    const totalParagraph = document.getElementById(CONSTS.TOTAL_ID) as HTMLParagraphElement
    const totalString = Number(total.toFixed(2)).toLocaleString("en", {
        minimumFractionDigits: 2,
    })
    totalParagraph.setAttribute("data-total", totalString)
    totalParagraph.textContent = `$${totalString}`
    totalParagraph.title = `$${totalString}`
}

/**
 * Increment the total with the specified amount
 * @param amount amount to increase total by
 */
const updateTotal = (amount: number): void => {
    const totalParagraph = document.getElementById(CONSTS.TOTAL_ID) as HTMLParagraphElement
    const totalRaw = totalParagraph.getAttribute("data-total")
    let total = 0.0
    if (totalRaw !== undefined) {
        total = parseFloat(totalRaw)
    }
    total += amount

    updateTotalText(total)
}

/**
 * Setter for specifying the rant level increments
 * @param newRantLevelValues list of new rant level cutoff values
 */
export const setRantLevelValues = (newRantLevelValues: Array<number>): void => {
    rantLevelValues = newRantLevelValues
}

/**
 * Setter for specifying the local sort order value
 * @param sortOrder new sort order value
 */
export const setLastSortOrder = (sortOrder: SortOrder): void => {
    lastSortOrder = sortOrder
}

/**
 * Clear the displayed messages
 */
export const clearDisplayedMessages = (): void => {
    displayedMessages.splice(0)
}

/**
 * Get the user details from the cached user data
 * @param user_id user id to get data for
 * @param username username (if known)
 * @param userImage path to profile image (if known)
 * @returns updated user details
 */
const getUserDetails = async (
    user_id: string,
    username: string = undefined,
    userImage: string = undefined,
): Promise<{
    username: string
    userImage: string
}> => {
    const user = await getUser(user_id)
    let realUsername = username
    let realUserImage = userImage

    if (user) {
        if (realUsername === undefined) {
            realUsername = user.username
        }
        if (realUserImage === undefined) {
            realUserImage = user.image
        }
    }

    if (realUsername === undefined) {
        realUsername = user_id
    }

    return {
        username: realUsername,
        userImage: realUserImage,
    }
}

/**
 * Get the rant level from the Rumble Rant amount
 * @param price_dollars amount of rant
 * @returns rant level
 */
const getMatchingRantLevel = (price_dollars: number): number => {
    let matchingRantLevel: number = 0

    rantLevelValues.forEach((rantLevel) => {
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
 * @param userImage path to user image
 * @param username username for user
 * @param messageId id of message being added
 * @returns image html
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
 * Get HTML representing the Rumble Rant
 * @param rant Rumble Rant to generate HTML for
 * @param messageId id of message
 * @param read true: message marked read
 * @returns Rant Data object:
 *
 *  - rantHTML (string) html for Rumble Rant
 *  - rantLevel (string) value representing the rant level group
 *  - amount: (number) amount of Rant
 */
const getRantHTML = (
    rant: RumbleRant,
    messageId: string,
    read: boolean,
): {
    rantHTML: string
    rantLevel: string
    amount: number
} => {
    if (!rant) {
        return {
            rantHTML: "",
            rantLevel: "",
            amount: 0,
        }
    }

    const priceDollars = rant.price_cents / 100
    const matchingRantLevel = getMatchingRantLevel(priceDollars)
    const rantLevel = `${matchingRantLevel}`

    // language=html
    const rantHTML = `
    <div class="rant-amount">
      <p>$${priceDollars.toFixed(2)}</p>
      <label for="${messageId}" class="show-hide-checkbox">
        Read:
        <input type="checkbox" id="${messageId}" class="${CONSTS.READ_CHECK}" ${read ? "checked" : ""} />
      </label>
    </div>
  `

    return {
        rantHTML,
        rantLevel,
        amount: priceDollars,
    }
}

/**
 * Get the html representing the badge image
 * @param badgeData the badge dat to render
 * @param imgClass class to set on the img element
 * @returns html representing the badge image
 */
const getBadgeImage = (badgeData: CacheBadge, imgClass: string): string => {
    return `<img class="${imgClass}" src="https://rumble.com${badgeData.icon}" alt="${badgeData.label}" title="${badgeData.label}">`
}

/**
 * Get the HTML representing the badge images
 * @param badges array of badge names
 * @returns HTML for user's badges
 */
const getBadgesHtml = async (badges: Array<string>): Promise<string> => {
    if (badges === undefined || badges.length === 0) {
        return ""
    }

    return getBadges().then((badgeInfoMap) => {
        let badgesHtml = `<div class="user-badges">`
        badges.forEach((name) => {
            const badgeMap = badgeInfoMap.get(name)
            const badgeHtml = getBadgeImage(badgeMap, "user-badge")
            badgesHtml = `${badgesHtml}${badgeHtml}`
        })

        badgesHtml += "</div>"
        return badgesHtml
    })
}

/**
 * Sort all rants in the list
 */
export const sortChats = (): void => {
    const chatList = document.getElementById(CONSTS.RANT_LIST_ID) as HTMLDivElement
    if (chatList === null) {
        return
    }
    const { children } = chatList

    const sorted = Array.from(children).sort((a, b) => {
        // the + converts the Date to a number
        const aDate = +new Date(a.getAttribute("data-date"))
        const bDate = +new Date(b.getAttribute("data-date"))
        const aAmount = parseInt(a.getAttribute(CONSTS.DATA_AMOUNT), 10)
        const bAmount = parseInt(b.getAttribute(CONSTS.DATA_AMOUNT), 10)

        switch (lastSortOrder) {
            case SortOrder.OldToNew:
                return aDate - bDate
            case SortOrder.NewToOld:
                return bDate - aDate
            case SortOrder.HighToLow:
                return bAmount - aAmount
            case SortOrder.LowToHigh:
                return aAmount - bAmount
            default:
                return 0
        }
    })
    chatList.innerHTML = ""
    sorted.forEach((child) => {
        chatList.appendChild(child)
    })
}

/**
 * Add HTML representing Rumble Rant to list and sort items
 * @param chatDiv HTML element representing the Rumble Rant
 * @param messageId id of message being added
 */
const addChat = (chatDiv: HTMLDivElement, messageId: string): void => {
    const chatList = document.getElementById(CONSTS.RANT_LIST_ID) as HTMLDivElement
    chatList.appendChild(chatDiv)
    displayedMessages.push(messageId)

    sortChats() // TODO: for speed, may want to not call sort everytime and instead just insert in the right location
}

/**
 * Render Rant in list
 * @param messageId id of the message
 * @param time Time message was posted
 * @param text text of the message
 * @param rant paid Rumble Rant data
 * @param username Username for user
 * @param userImage Optional path to profile image
 * @param badges badges for user
 * @param read true: message should be marked read
 * @param cachePage true: data being displayed on cache page
 */
const renderRant = async (
    messageId: string,
    time: string,
    text: string,
    rant: RumbleRant,
    username: string,
    userImage: string,
    badges: Array<string> = undefined,
    read: boolean = false,
    cachePage: boolean = false,
): Promise<void> => {
    const { rantHTML, rantLevel, amount } = getRantHTML(rant, messageId, read)
    const userImageHTML = getUserImageHtml(userImage, username, messageId)
    const badgesHTML = await getBadgesHtml(badges)

    const chatDate = new Date(time)
    const isoDate = chatDate.toISOString()

    const chatDiv = document.createElement("div") as HTMLDivElement
    chatDiv.classList.add("external-chat")
    if (read) {
        chatDiv.classList.add("read")
    }
    chatDiv.setAttribute("data-level", rantLevel)
    chatDiv.setAttribute("data-chat-id", messageId)
    chatDiv.setAttribute("data-date", isoDate)
    chatDiv.setAttribute(CONSTS.DATA_AMOUNT, amount.toString())

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
    if (userImageElement) userImageElement.addEventListener("error", imageErrorHandler)

    updateTotal(amount)
}

/**
 * Render a notification
 * @param messageId id of the message
 * @param time Time message was posted
 * @param notification notification associated with Rant
 * @param username Username for user
 * @param userImage Optional path to profile image
 * @param cachePage true: data being displayed on cache page
 * @returns A void promise
 */
const renderNotification = async (
    messageId: string,
    time: string,
    notification: Notification,
    username: string,
    userImage: string,
    cachePage: boolean = false,
): Promise<void> => {
    if (notification.text === undefined || notification.badge === undefined) {
        return
    }

    const userImageHTML = getUserImageHtml(userImage, username, messageId)

    const badgeData = await getBadge(notification.badge)
    let badgeHtml = ""
    if (badgeData) {
        badgeHtml = getBadgeImage(badgeData, "notification-badge")
    }

    const chatDate = new Date(time)
    const isoDate = chatDate.toISOString()

    const chatDiv = document.createElement("div") as HTMLDivElement
    chatDiv.classList.add("external-chat")
    chatDiv.classList.add("notification")
    if (notification.read) {
        chatDiv.classList.add("read")
    }
    chatDiv.setAttribute("data-chat-id", messageId)
    chatDiv.setAttribute("data-date", isoDate)

    let html = `
        <div class="notification-info">
            <time class="timestamp" datatype="${isoDate}">${chatDate.toLocaleDateString()}
                ${chatDate.toLocaleTimeString()}
            </time>
            <label for="${messageId}" class="show-hide-checkbox">
                Read:
                <input type="checkbox" id="${messageId}" class="${CONSTS.READ_CHECK}" ${
                    notification.read ? "checked" : ""
                }/>
            </label>
        </div>
    `
    if (cachePage) {
        html = `
            ${html}
            <div class="rant-data">
                <div class="user-image">${userImageHTML}</div>

                <div class="rant-details">
                    <div class="user-info">
                        <p class="notification-text">${username} ${notification.text}</p>
                        ${badgeHtml}
                    </div>
                </div>
            </div>
        `
    } else {
        html = `
            ${html}
            <div class="user-info">
                <div class="user-image">${userImageHTML}</div>
                <p class="notification-text">${username} ${notification.text}</p>
                ${badgeHtml}
            </div>
        `
    }
    chatDiv.innerHTML = html

    addChat(chatDiv, messageId)

    const userImageElement = document.getElementById(`img-${messageId}`) as HTMLImageElement
    if (userImageElement) userImageElement.addEventListener("error", imageErrorHandler)
}

/**
 * Render Rumble Rant
 * @param videoId id of video
 * @param messageId id of the message
 * @param time Time message was posted
 * @param userId id of user who made message
 * @param text text of the message
 * @param rant paid Rumble Rant data
 * @param notification notification associated with Rant
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
    notification: RumbleNotification = undefined,
    username: string = undefined,
    userImage: string = undefined,
    badges: Array<string> = undefined,
    cached: boolean = false,
    read: boolean = false,
    cachePage: boolean = false,
): Promise<void> => {
    // skip if message already shown
    if (displayedMessages.includes(messageId)) {
        return
    }

    let realUsername = username
    let realUserImage = userImage
    if (realUsername === undefined || realUserImage === undefined || realUsername === userId) {
        const userDetails = await getUserDetails(userId, realUsername, realUserImage)
        realUsername = userDetails.username
        realUserImage = userDetails.userImage
    }

    if (!cached) {
        // don't cache if already cached
        const cachedVideoIds = await getAllCachedMessageIds(videoId)
        if (cachedVideoIds.includes(messageId)) {
            return
        }

        cacheMessage(videoId, {
            id: messageId,
            time,
            user_id: userId,
            text,
            username: realUsername,
            rant: {
                price_cents: rant?.price_cents,
            },
            notification,
            badges,
            read,
        }).then()
    }

    // subscription may not have a message text so don't render
    if (rant && text !== "") {
        await renderRant(messageId, time, text, rant, realUsername, realUserImage, badges, read, cachePage)
    }
    if (notification) {
        const messageIdNotification = `${messageId}-notification`
        await renderNotification(messageIdNotification, time, notification, realUsername, realUserImage, cachePage)
    }
}
/**
 * Toggle the 'read' state of the Rumble Rant
 * @param event click event
 * @param messageId message id to toggle 'read' on
 * @param notification indicates notification is being toggled
 */
const toggleRead = (event: Event, messageId: string, notification: boolean): void => {
    const videoId = getVideoIdFromDiv()
    const checkbox = event.target as HTMLInputElement

    let data: {
        read?: boolean
        notification?: {
            read: boolean
        }
    } = {
        read: checkbox.checked,
    }
    if (notification) {
        data = {
            notification: {
                read: checkbox.checked,
            },
        }
    }

    // update value in cache
    const baseMessageId = messageId.replace("-notification", "")
    updateCachedMessage(videoId, baseMessageId, data).then(() => {
        const rantDiv = document.querySelector(`[data-chat-id="${messageId}"]`)
        rantDiv.classList.toggle("read")
    })
}

document.addEventListener("change", async (event) => {
    const target = event.target as HTMLElement
    if (target?.classList.contains(CONSTS.READ_CHECK)) {
        const messageId = target.id
        const notification = target.id.endsWith("-notification")
        toggleRead(event, messageId, notification)
    }
})
