import { getLastWidth, getSortOrder, getStream, setLastWidth } from "../../cache"
import { triggerOpenOptionsPage } from "../events/events"
import { updateTheme } from "../../theme"
import { CONSTS } from "../../types/consts"
import { getVideoIdFromDiv } from "../../utils"
import { setChatButtonEnable } from "../open-chat/chat-buttons"
import { startStream, stopStream } from "../rumble/stream"

import { clearDisplayedMessages } from "./rant"
import { setupForDisplayingCached } from "./cached-rants"

/**
 * Helper for getting resizer HTML element
 * @returns resizer element
 */
const getResizer = (): HTMLDivElement => {
    return document.getElementById(CONSTS.RESIZE_ID) as HTMLDivElement
}

/**
 * Set the width of the sidebar
 *
 * Sets the width on the style attribute of thee sidebar.
 * @param width width of sidebar in pixels
 */
const setSidebarWidth = (width: number): void => {
    const resizeElement = getResizer()
    const parent = resizeElement.parentNode as HTMLDivElement

    parent.style.width = `${width}px`
}

/**
 * Register the resizer event handlers
 */
const registerResizer = (): void => {
    const resizeElement = getResizer()
    let mousePosition: number

    /**
     * Resize sidebar based on mouse x position
     * @param e the mouse event
     */
    const resize = (e: MouseEvent): void => {
        mousePosition = e.x
        setSidebarWidth(mousePosition)
    }

    resizeElement.addEventListener(
        "mousedown",
        (e) => {
            mousePosition = e.x
            e.preventDefault()
            document.addEventListener("mousemove", resize, false)
        },
        false,
    )
    resizeElement.addEventListener("mouseup", (e) => {
        setLastWidth(e.x).then(() => {})
    })
    document.addEventListener(
        "mouseup",
        () => {
            document.removeEventListener("mousemove", resize, false)
        },
        false,
    )
}

/**
 * Add the sidebar for displaying the Rants
 * @param videoId id of video
 * @param popup true: sidebar shown in popup
 * @param cache true: opening for cache
 */
export const addRantStatsSidebar = async (
    videoId: string,
    popup: boolean = false,
    cache: boolean = false,
): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-console
    if (DEBUG) console.log(`open rant stats sidebar for video ${videoId}`)

    const existingSidebar = document.getElementById(CONSTS.SIDEBAR_ID)
    if (existingSidebar !== null && !popup) {
        // eslint-disable-next-line no-alert
        window.alert(`An existing sidebar is detected. Refresh the page and try again if it is not visible.`)
        return
    }

    const width = await getLastWidth()
    const sortOrder = await getSortOrder()
    const popupClass = popup ? CONSTS.POPUP_CLASS : ""
    const sidebarStyle = popup ? "" : `width: ${width}px;`
    const html = `
        <!--suppress CssInvalidPropertyValue -->
        <div 
                id="${CONSTS.SIDEBAR_ID}" 
                class="${popupClass}"
                style="${sidebarStyle}"
                data-video-id="${videoId}"
        >
            <div id="resize"></div>
            <header>
                <h1 id="${CONSTS.SIDEBAR_TITLE_ID}">Rant Stats</h1>
            </header>
            <div class="hidden" id="${CONSTS.ERROR_ID}">
                <p>Could not load chats, is the livestream over or are you not logged in to Rumble? Any cached Rants shown below.</p>
            </div>
            <div class="hidden" id="${CONSTS.CACHE_MESSAGE_ID}">
                <p>Stream is over, dispalying <span id="${CONSTS.CACHE_MESSAGE_COUNT_ID}">-1</span> cached rants.</p>
            </div>
            <div id="rant-list" data-sort-order="${sortOrder}"></div>
            <footer>
                <p id="${CONSTS.TOTAL_ID}" class="link" data-total="0">$0.00</p>
                <p id="${CONSTS.DOWNLOAD_CSV_ID}" class="link">Export to CSV</p>
                <p id="${CONSTS.OPEN_OPTIONS_ID}" class="link">Open Options</p>
                <svg id="${CONSTS.POPOUT_ICON_ID}" class="link" data-cache="${cache}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <title>Open as popup</title>
                    <path d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/>
                </svg>
            </footer>
        </div>
    `

    const { body } = document
    body.insertAdjacentHTML("beforebegin", html)
    await updateTheme()

    registerResizer()

    // disable button to open Rant Stats
    setChatButtonEnable(false)

    // start capturing chats
    if (cache) {
        setupForDisplayingCached(videoId, false)
    } else {
        startStream(videoId)
    }
}

/**
 * Handle saving cached data for stream to a CSV file
 * @param event click event
 */
export const downloadCSV = (event: Event): void => {
    const videoId = getVideoIdFromDiv()
    if (videoId === null) {
        return
    }
    getStream(videoId).then((streamData) => {
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
            if (data.rant && data.rant?.price_cents !== undefined) {
                rantAmount = (data.rant.price_cents / 100).toString()
            }
            rows.push([
                JSON.stringify(data.id),
                JSON.stringify(data.time),
                JSON.stringify(data.user_id),
                JSON.stringify(data.username),
                JSON.stringify(data.text),
                JSON.stringify(rantAmount),
                JSON.stringify(data.read),
            ])
        })

        const encodedData = encodeURIComponent(rows.map((row) => row.join(",")).join("\n"))
        const csvData = `data:text/csv;charset=utf-8,${encodedData}`
        const link = document.createElement("a") as HTMLAnchorElement
        link.href = csvData
        link.download = "rant_stats.csv"
        link.click()
    })

    event.preventDefault()
}

/**
 * Open popup window for displaying rants
 * @param videoId id of video
 * @param cache true: button handle for cache
 */
export const openRantPopout = (videoId: string, cache: boolean): void => {
    const cacheParam = cache ? `&cache=${cache}` : ""
    window.open(`https://rumble.com/_rantstats?v=${videoId}${cacheParam}`, videoId, "width=400,height=600")
}

/**
 * Popout the sidebar in popup window
 * @param cache true: button handle for cache
 */
export const popoutSidebar = (cache: boolean = false): void => {
    const videoId = getVideoIdFromDiv()
    openRantPopout(videoId, cache)
    stopStream()
    document.getElementById(CONSTS.SIDEBAR_ID).remove()
    setChatButtonEnable(true)
    clearDisplayedMessages()
}

document.addEventListener("click", async (event) => {
    const target = event.target as HTMLElement
    const disabled = target.classList.contains("disabled")
    if (target) {
        if (target.id === CONSTS.DOWNLOAD_CSV_ID && !disabled) {
            downloadCSV(event)
        } else if (target.id === CONSTS.OPEN_OPTIONS_ID) {
            triggerOpenOptionsPage()
        } else if (target.id === CONSTS.POPOUT_ICON_ID) {
            const cache = target.getAttribute("data-cache")
            const cacheValue = cache === undefined ? false : cache === "true"
            popoutSidebar(cacheValue)
        }
    }
})
