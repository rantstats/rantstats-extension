import {
    CacheBadge,
    CachedRant,
    getAllCachedMessages,
    getLastWidth,
    getSortOrder,
    getStream,
    saveBadges,
    setLastWidth,
    updateUser
} from "../../cache";
import {triggerOpenOptionsPage} from "../../events";
import {updateTheme} from "../../theme";
import {
    CACHE_MESSAGE_COUNT_ID,
    CACHE_MESSAGE_ID,
    DOWNLOAD_CSV_ID,
    ERROR_ID,
    LEVEL_STYLE_ID,
    OPEN_OPTIONS_ID,
    POPOUT_ICON_ID,
    POPUP_CLASS,
    RESIZE_ID,
    SIDEBAR_ID,
    SIDEBAR_TITLE_ID,
    TOTAL_ID
} from "../../types/consts";
import {
    RantsConfig,
    RumbleBadge,
    RumbleConfig,
    RumbleEventInit,
    RumbleEventMessages,
    RumbleEventType,
    RumbleRant,
    RumbleRantLevel,
    RumbleUser
} from "../../types/rumble-types";
import {getVideoIdFromDiv} from "../../utils";
import {setChatButtonEnable} from "../open-chat/open-chat";
import {activeStream, setupForDisplayingCached, startStream, stopStream} from "../rumble/stream-handler";
import {clearDisplayedMessages, parseMessages, renderMessage, setRantLevelValues} from "./rant";

/**
 * Helper for getting resizer HTML element
 *
 * @return resizer element
 */
const getResizer = (): HTMLDivElement => {
    return document.getElementById(RESIZE_ID) as HTMLDivElement
}

/**
 * Set the width of the sidebar
 *
 * Sets the width on the style attribute of thee sidebar.
 *
 * @param width width of sidebar in pixels
 */
const setSidebarWidth = (width: number) => {
    const resize_el = getResizer()
    const parent = resize_el.parentNode as HTMLDivElement

    parent.style.width = `${width}px`
}

/**
 * Register the resizer event handlers
 */
const registerResizer = () => {
    const resize_el = getResizer()
    let m_pos

    function resize(e) {
        m_pos = e.x
        setSidebarWidth(parseInt(m_pos))
    }

    resize_el.addEventListener(
            "mousedown",
            (e) => {
                m_pos = e.x
                e.preventDefault()
                document.addEventListener("mousemove", resize, false)
            },
            false
    )
    resize_el.addEventListener(
            "mouseup",
            (e) => {
                setLastWidth(e.x)
                        .then(() => {
                        })
            })
    document.addEventListener(
            "mouseup",
            () => {
                document.removeEventListener("mousemove", resize, false)
            },
            false
    )
}

/**
 * Add the sidebar for displaying the Rants
 *
 * @param videoId id of video
 * @param popup true: sidebar shown in popup
 * @param cache true: opening for cache
 */
export const addRantStatsSidebar = async (videoId: string, popup: boolean = false, cache: boolean = false) => {
    console.log(`open rant stats sidebar for video ${videoId}`)

    const existingSidebar = document.getElementById(SIDEBAR_ID)
    if (existingSidebar !== null && !popup) {
        alert(`An existing sidebar is detected. Refresh the page and try again if it is not visible.`)
        return
    }

    const width = await getLastWidth()
    const sortOrder = await getSortOrder()
    const popupClass = popup ? POPUP_CLASS : ""
    const sidebarStyle = popup ? "" : `width: ${width}px;`
    const html = `
        <!--suppress CssInvalidPropertyValue -->
        <div 
                id="${SIDEBAR_ID}" 
                class="${popupClass}"
                style="${sidebarStyle}"
                data-video-id="${videoId}"
        >
            <div id="resize"></div>
            <header>
                <h1 id="${SIDEBAR_TITLE_ID}">Rant Stats</h1>
            </header>
            <div class="hidden" id="${ERROR_ID}">
                <p>Could not load chats, is the livestream over or are you not logged in to Rumble? Any cached Rants shown below.</p>
            </div>
            <div class="hidden" id="${CACHE_MESSAGE_ID}">
                <p>Stream is over, dispalying <span id="${CACHE_MESSAGE_COUNT_ID}">-1</span> cached rants.</p>
            </div>
            <div id="rant-list" data-sort-order="${sortOrder}"></div>
            <footer>
                <p id="${TOTAL_ID}" class="link" data-total="0">$0.00</p>
                <p id="${DOWNLOAD_CSV_ID}" class="link">Export to CSV</p>
                <p id="${OPEN_OPTIONS_ID}" class="link">Open Options</p>
                <svg id="${POPOUT_ICON_ID}" class="link" data-cache="${cache}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>Open as popup</title>
                    <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/>
                </svg>
            </footer>
        </div>
    `

    const body = document.body
    body.insertAdjacentHTML("beforebegin", html)
    await updateTheme()

    registerResizer()

    // disable button to open Rant Stats
    setChatButtonEnable(false)

    // start capturing chats
    if (cache) {
        setupForDisplayingCached(videoId)
    } else {
        startStream(videoId)
    }
}

/**
 * Handle saving cached data for stream to a CSV file
 *
 * @param event click event
 */
export const downloadCSV = (event: Event) => {
    const videoId = getVideoIdFromDiv()
    if (videoId === null) {
        return
    }
    getStream(videoId)
            .then((streamData) => {
                const rows = [
                    ["Stream", JSON.stringify(streamData.title)],
                    ["URL", JSON.stringify(streamData.url)],
                    ["Video ID", JSON.stringify(streamData.videoId)],
                    ["Creator", JSON.stringify(streamData.creator), JSON.stringify(streamData.creatorUrl)],
                    ["Date", JSON.stringify(streamData.time)],
                    [],
                    ["Id", "Time", "User", "Username", "Text", "Rant Amount", "Read"],
                ]

                streamData.rants.forEach((data) => {
                    let rantAmount = ""
                    if (data.rant) {
                        rantAmount = (data.rant.price_cents / 100).toString()
                    }
                    rows.push([
                        JSON.stringify(data.id),
                        JSON.stringify(data.time),
                        JSON.stringify(data.user_id),
                        JSON.stringify(data.username),
                        JSON.stringify(data.text),
                        JSON.stringify(rantAmount),
                        JSON.stringify(data.read)
                    ])
                })

                const encodedData = encodeURIComponent(rows.map(row => row.join(",")).join("\n"))
                const csvData = `data:text/csv;charset=utf-8,${encodedData}`
                const link = document.createElement("a") as HTMLAnchorElement
                link.href = csvData
                link.download = "rant_stats.csv"
                link.click()
            })

    event.preventDefault()
}

/**
 * Handle chat stream {@link RumbleEventType.init} message
 *
 * @param eventData received init message data
 * @param videoId id of video
 */
export const initEventHandler = (eventData: RumbleEventInit, videoId: string) => {
    const type = eventData.type
    if (type !== RumbleEventType.init) {
        console.error(`Invalid event type passed to init event handler: ${type}`)
    }

    const data = eventData.data

    parseConfig(data.config)
    const userBadges = parseUsers(data.users)
    displayCachedRants(videoId)
    parseMessages(data.messages, data.users, videoId, userBadges)
}

/**
 * Parse config data from received message
 *
 * @param config received config data
 */
const parseConfig = (config: RumbleConfig) => {
    const {rants, badges} = config

    parseBadgeDefinitions(badges)

    if (rants === null) {
        console.log('Invalid Rumble config, no rants', config)
        return
    }
    parseRants(rants)
}

/**
 * Parse the badge definitions and store in cache
 *
 * @param badges received badge definition data
 */
const parseBadgeDefinitions = (badges: { [key: string]: RumbleBadge }) => {
    const cacheBadges: Array<CacheBadge> = new Array<CacheBadge>()

    if (badges === undefined) {
        return
    }

    for (const name in badges) {
        const values = badges[name]
        const {icons, label} = values

        // use the icon with the biggest size
        let iconSize = 0
        let icon = ""
        for (const iconKey in icons) {
            const iconKeyValue = parseInt(iconKey, 10)
            if (iconKeyValue > iconSize) {
                icon = icons[iconKey]
            }
        }
        // if no valid icon found, skip
        if (icon === "") {
            continue
        }

        let labelText = label["en"]
        if (labelText === undefined) {
            // noinspection LoopStatementThatDoesntLoopJS
            for (const labelKey in label) {
                labelText = label[labelKey]
                break
            }
        }

        cacheBadges.push({
            name: name,
            icon: icon,
            label: labelText,
        })
    }

    saveBadges(cacheBadges).then()
}

/**
 * Parse rant data from received message
 *
 * @param rants received rant data
 */
const parseRants = (rants: RantsConfig) => {
    const levels = rants.levels
    if (levels === null) {
        console.log('Invalid rants config, no levels', levels)
        return
    }
    parseLevels(levels)
}

/**
 * Parse level data from received message
 *
 * @param levels received level data
 * @param fallback true: fallback to hardcoded levels and formatting rather than using received data
 */
export const parseLevels = (levels: Array<RumbleRantLevel>, fallback: boolean = false) => {
    if (document.getElementById(LEVEL_STYLE_ID)) {
        return
    }

    let styleLines = []

    if (fallback || levels.length == 0) {
        setRantLevelValues([1, 2, 5, 10, 20, 50, 100, 200, 300, 400, 500])
        styleLines.push(...[
            '.external-chat[data-level="1"] { background: #4382CB !important; }',
            '.external-chat[data-level="1"] * {color: white !important; }',
            '.external-chat[data-level="1"] .rant-amount { background: #4A90E2 !important; }',
            '.external-chat[data-level="2"] { background: #A6D279 !important; }',
            '.external-chat[data-level="2"] * {color: black !important; }',
            '.external-chat[data-level="2"] .rant-amount { background: #B8E986 !important; }',
            '.external-chat[data-level="5"] { background: #DFD019 !important; }',
            '.external-chat[data-level="5"] * {color: black !important; }',
            '.external-chat[data-level="5"] .rant-amount { background: #F8E71C !important; }',
            '.external-chat[data-level="10"] { background: #DD9520 !important; }',
            '.external-chat[data-level="10"] * {color: black !important; }',
            '.external-chat[data-level="10"] .rant-amount { background: #F5A623 !important; }',
            '.external-chat[data-level="20"] { background: #AA0ECA !important; }',
            '.external-chat[data-level="20"] * {color: white !important; }',
            '.external-chat[data-level="20"] .rant-amount { background: #BD10E0 !important; }',
            '.external-chat[data-level="50"] { background: #8211E5 !important; }',
            '.external-chat[data-level="50"] * {color: white !important; }',
            '.external-chat[data-level="50"] .rant-amount { background: #9013FE !important; }',
            '.external-chat[data-level="100"] { background: #BB0218 !important; }',
            '.external-chat[data-level="100"] * {color: white !important; }',
            '.external-chat[data-level="100"] .rant-amount { background: #D0021B !important; }',
            '.external-chat[data-level="200"] { background: #BB0218 !important; }',
            '.external-chat[data-level="200"] * {color: white !important; }',
            '.external-chat[data-level="200"] .rant-amount { background: #D0021B !important; }',
            '.external-chat[data-level="300"] { background: #BB0218 !important; }',
            '.external-chat[data-level="300"] * {color: white !important; }',
            '.external-chat[data-level="300"] .rant-amount { background: #D0021B !important; }',
            '.external-chat[data-level="400"] { background: #BB0218 !important; }',
            '.external-chat[data-level="400"] * {color: white !important; }',
            '.external-chat[data-level="400"] .rant-amount { background: #D0021B !important; }',
            '.external-chat[data-level="500"] { background: #BB0218 !important; }',
            '.external-chat[data-level="500"] * {color: white !important; }',
            '.external-chat[data-level="500"] .rant-amount { background: #D0021B !important; }',
        ])
    } else {
        let rantLevelValues = []
        levels.forEach((rantLevel: RumbleRantLevel) => {
            rantLevelValues.push(rantLevel.price_dollars)
            const externalChat = `.external-chat[data-level="${rantLevel.price_dollars}"]`
            styleLines.push(...[
                `${externalChat} {`,
                `background: ${rantLevel.colors.bg2} !important;`,
                `}`,
                `${externalChat} * {`,
                `color: ${rantLevel.colors.fg} !important;`,
                `}`,
                `${externalChat} .rant-amount {`,
                `background: ${rantLevel.colors.main} !important;`,
                `}`,
            ])
        })

        rantLevelValues.sort()
        setRantLevelValues(rantLevelValues)
    }

    const levelStyle = document.createElement("style") as HTMLStyleElement
    levelStyle.id = LEVEL_STYLE_ID
    levelStyle.appendChild(document.createTextNode(styleLines.join(" ")))
    document.head.appendChild(levelStyle)
}

/**
 * Parse user data from received message
 *
 * @param users received user data
 * @return map of user id to badges for user
 */
const parseUsers = (users: Array<RumbleUser>): Map<string, Array<string>> => {
    const badges: Map<string, Array<string>> = new Map<string, Array<string>>()
    users.forEach((user: RumbleUser) => {
        // only save if has image
        if (user["image.1"]) {
            updateUser(user.id, {
                id: user.id,
                username: user.username,
                image: user["image.1"],
            })
                    .then()
        }

        if (user.badges) {
            badges.set(user.id, user.badges)
        }

    })
    return badges
}

/**
 * Handle chat stream {@link RumbleEventType.messages} message
 *
 * @param eventData received messages message data
 * @param videoId id of video
 */
export const messagesEventHandler = (eventData: RumbleEventMessages, videoId: string) => {
    const type = eventData.type
    if (type !== RumbleEventType.messages) {
        console.error(`Invalid event type passed to messages event handler: ${type}`)
    }

    const data = eventData.data

    const userBadges = parseUsers(data.users)
    parseMessages(data.messages, data.users, videoId, userBadges)
}

/**
 * Display all cached rant
 *
 * @param videoId id of video
 * @param cachePage true: open in extension cache page rather than sidebar
 */
export const displayCachedRants = (videoId: string, cachePage: boolean = false) => {
    getAllCachedMessages(videoId)
            .then((cachedRants: Array<CachedRant>) => {
                cachedRants.forEach((value) => {
                    renderMessage(
                            videoId, value.id, value.time, value.user_id, value.text,
                            value.rant as RumbleRant, value.username,
                            undefined, value.badges, true, value.read,
                            cachePage
                    )
                            .then()
                })
                return cachedRants.length
            })
            .then((numRants) => {
                showCacheMessage(videoId, numRants)
            })
}

const showCacheMessage = (videoId: string, numRants: number) => {
    if (!activeStream() && (location.host === 'rumble.com')) {
        const cacheMessageP = document.getElementById(CACHE_MESSAGE_ID) as HTMLParagraphElement
        const cacheMessageCount = document.getElementById(CACHE_MESSAGE_COUNT_ID) as HTMLSpanElement
        cacheMessageCount.textContent = `${numRants}`
        cacheMessageP.classList.remove('hidden')
    }

}

/**
 * Popout the sidebar in popup window
 *
 * @param cache true: button handle for cache
 */
export const popoutSidebar = (cache: boolean = false) => {
    const videoId = getVideoIdFromDiv()
    openRantPopout(videoId, cache)
    stopStream()
    document.getElementById(SIDEBAR_ID).remove()
    setChatButtonEnable(true)
    clearDisplayedMessages()
}

/**
 * Open popup window for displaying rants
 *
 * @param videoId id of video
 * @param cache true: button handle for cache
 */
export const openRantPopout = (videoId: string, cache: boolean) => {
    const cacheParam = cache ? `&cache=${cache}` : ''
    window.open(`https://rumble.com/_rantstats?v=${videoId}${cacheParam}`, videoId, "width=400,height=600")
}

document.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement
    const disabled = target.classList.contains('disabled')
    if (target) {
        if (target.id === DOWNLOAD_CSV_ID && !disabled) {
            downloadCSV(event)
        } else if (target.id === OPEN_OPTIONS_ID) {
            triggerOpenOptionsPage()
        } else if (target.id === POPOUT_ICON_ID) {
            const cache = target.getAttribute('data-cache')
            const cacheValue = cache === undefined ? false : cache === 'true'
            popoutSidebar(cacheValue)
        }
    }
})
