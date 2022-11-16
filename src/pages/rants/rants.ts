import {cleanHistory, getAllStreams, getSortOrder, getStream, removeStream} from "../../cache";
import {clearDisplayedMessages, setLastSortOrder, updateTotalText} from "../../components/rants/rant";
import {displayCachedRants, parseLevels} from "../../components/rants/rants";
import {registerTab} from "../../events";
import {handleUpdateOptions} from "../../messages";
import {registerThemeWatcher, updateTheme, updateThemeStyle} from "../../theme";
import {
    DELETE_STREAM_ID,
    DOWNLOAD_CSV_ID,
    RANT_LIST_ID,
    REFRESH_ICON,
    STREAM_CREATOR,
    STREAM_DATA,
    STREAM_DATE,
    STREAM_TITLE
} from "../../types/consts";
import {Message, Messages} from "../../types/messages";
import {Theme} from "../../types/option-types";
import {getVideoIdFromDiv} from "../../utils";

const streamSelect = document.getElementById('stream') as HTMLSelectElement
const streamDataHeader = document.getElementById(STREAM_DATA) as HTMLDivElement
const rantListMain = document.getElementById(RANT_LIST_ID) as HTMLDivElement
const csvDownloaderParagraph = document.getElementById(DOWNLOAD_CSV_ID) as HTMLParagraphElement
const deleteStreamParagraph = document.getElementById(DELETE_STREAM_ID) as HTMLParagraphElement

/**
 * Helper for resetting the page data
 */
const clearRants = () => {
    streamDataHeader.innerHTML = ''
    rantListMain.innerHTML = ''
    rantListMain.removeAttribute('data-video-id')
    csvDownloaderParagraph.classList.add('disabled')
    deleteStreamParagraph.classList.add('disabled')
    updateTotalText(0)
    clearDisplayedMessages()
}

/**
 * Load the data for the specified stream and populate the page
 *
 * @param videoId id of the video to load
 */
const loadStream = async (videoId: string) => {
    const videoIdInt = parseInt(videoId)

    // clear rants
    clearRants()

    if (videoIdInt > 0) {
        rantListMain.setAttribute('data-video-id', videoId)
        csvDownloaderParagraph.classList.remove('disabled')
        deleteStreamParagraph.classList.remove('disabled')

        // load rants for selected
        console.log("Loading Rants for video", videoId)
        displayCachedRants(videoId, true)

        const cachedStream = await getStream(videoId)
        const title = cachedStream.title
        let creator = cachedStream.creator
        const time = cachedStream.time
        const url = cachedStream.url
        const creatorUrl = cachedStream.creatorUrl

        if (creator === null) {
            creator = ''
        }
        let date = ''
        if (time !== null) {
            date = new Date(time).toLocaleDateString()
        }

        let headingHtml = `<h2 id="${STREAM_TITLE}">${title}</h2>`
        if (url) {
            headingHtml = `<h2 id="${STREAM_TITLE}"><a href="${url}" target="_blank">${title}</a></h2>`
        }

        let creatorSpan = `<span id="${STREAM_CREATOR}">${creator}</span>`
        if (creatorUrl) {
            creatorSpan = `<span id="${STREAM_CREATOR}"><a href="${creatorUrl}" target="_blank">${creator}</a></span>`
        }

        const refreshIcon = document.createElement('div') as HTMLDivElement
        refreshIcon.classList.add('refresh')
        refreshIcon.innerHTML = `
            <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                id="${REFRESH_ICON}"
                data-id="${videoId}"
            >
                <path d="M20.944 12.979c-.489 4.509-4.306 8.021-8.944 8.021-2.698 0-5.112-1.194-6.763-3.075l1.245-1.633c1.283 1.645 3.276 2.708 5.518 2.708 3.526 0 6.444-2.624 6.923-6.021h-2.923l4-5.25 4 5.25h-3.056zm-15.864-1.979c.487-3.387 3.4-6 6.92-6 2.237 0 4.228 1.059 5.51 2.698l1.244-1.632c-1.65-1.876-4.061-3.066-6.754-3.066-4.632 0-8.443 3.501-8.941 8h-3.059l4 5.25 4-5.25h-2.92z"/>
            </svg>
        `

        streamDataHeader.innerHTML = `
            <div class="main-content">
                ${headingHtml}
                <p>By: ${creatorSpan} on <span id="${STREAM_DATE}">${date}</span></p>
            </div>
            ${refreshIcon.outerHTML}
        `
    }
}

/**
 * Populate the list of all cached streams
 */
const populateStreamList = () => {
    streamSelect.innerHTML = ''
    const defaultOption = document.createElement('option') as HTMLOptionElement
    defaultOption.value = '-1'
    defaultOption.text = 'None'
    streamSelect.appendChild(defaultOption)

    getAllStreams()
            .then((cachedStreams) => {
                cachedStreams.sort((a, b) => {
                    return parseInt(a.videoId) - parseInt(b.videoId)
                })

                const optGroups: Map<string, Array<HTMLOptionElement>> = new Map<string, Array<HTMLOptionElement>>()

                cachedStreams.forEach((cachedStream) => {
                    const option = document.createElement('option') as HTMLOptionElement
                    option.value = cachedStream.videoId
                    const time = new Date(cachedStream.time)
                    option.text = `${time.toLocaleDateString()} - ${cachedStream.title}`
                    const creator = cachedStream.creator || 'Unknown'

                    const currentOptions = optGroups.get(creator) || []
                    currentOptions.push(option)

                    optGroups.set(creator, currentOptions)
                })

                const creators: Array<string> = Array.from(optGroups.keys())
                creators.sort()
                creators.forEach((creator) => {
                    const options = optGroups.get(creator)
                    const optionGroup = document.createElement('optgroup') as HTMLOptGroupElement
                    optionGroup.label = creator
                    options.forEach((option) => {
                        optionGroup.appendChild(option)
                    })
                    streamSelect.appendChild(optionGroup)
                })

            })
}

/**
 * Refresh the currently loaded stream data
 */
const refresh = () => {
    const videoId = getVideoIdFromDiv()
    clearRants()
    populateStreamList()
    if (videoId === null) {
        return
    }
    loadStream(videoId).then(() => {
        streamSelect.value = videoId
    })
}

/**
 * Delete the current stream (after confirmation)
 */
const deleteStream = () => {
    const videoId = getVideoIdFromDiv()
    if (videoId === null) {
        return
    }

    getStream(videoId)
            .then((streamData) => {
                const doDelete = confirm(`Are you sure you want to delete '${streamData.title}'?`)
                if (doDelete) {
                    removeStream(videoId)
                            .then(() => {
                                clearRants()
                                populateStreamList()
                            })
                }
            })
}

chrome.runtime.onMessage.addListener(
        /**
         * Register extension messaging listener
         *
         * @param message received Message
         */
        (message: Message) => {
            switch (message.action) {
                case Messages.OPTIONS_SAVED_TAB:
                    handleUpdateOptions(message.data.options)
                    break
                case Messages.RUMBLE_THEME_CHANGED_TAB:
                    updateThemeStyle(message.data.theme as Theme)
                    break
                default:
                    break
            }
        }
)

// run clean history at the beginning of each load
cleanHistory().then()

/**
 * Initialize the page
 */
const populateView = async () => {
    registerThemeWatcher()
    updateTheme().then()
    setLastSortOrder(await getSortOrder())

    populateStreamList()

    parseLevels([], true)
}

populateView().then()

document.addEventListener('DOMContentLoaded', () => {
    streamSelect.addEventListener('change', (event) => {
        const target = event.target as HTMLSelectElement
        loadStream(target.value).then()
    })
})
document.addEventListener('click', async (event) => {
    const target = event.target as HTMLElement
    const disabled = target.classList.contains('disabled')
    if (target) {
        if (target.id === REFRESH_ICON) {
            refresh()
        } else if (target.id === DELETE_STREAM_ID && !disabled) {
            deleteStream()
        }
    }
})

registerTab()
