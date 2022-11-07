import {getAllVideoIs, getStream} from "./cache";
import {addRantStatsSidebar} from "./components/rants/rants";

/**
 * Replace page content on Rumble when viewing popup URL
 */
export const replacePageContent = async (): Promise<boolean> => {
    const mains = document.getElementsByTagName('main') as HTMLCollectionOf<HTMLDivElement>
    if (mains.length !== 1) {
        return false
    }
    const main = mains[0]

    const params = new URLSearchParams(window.location.search)
    const videoId = params.get('v')
    const cache = params.get('cache')
    const cacheValue = cache === undefined ? false : cache === 'true'

    const cachedVideoIds = await getAllVideoIs()
    const validVideoId = cachedVideoIds.includes(videoId)
    let errorDivHTML = ''
    if (!validVideoId) {
        errorDivHTML = `
            <div>
                <h2 class="h1 error-header">Invalid Video ID</h2>
                <p>The specified video id '${videoId}' has not been cached.</p>
                <p>This page can only be used to view live rants when opened from stream or previously cached rants.</p>
            </div>
        `
    }

    // assume page was visited from history
    main.outerHTML = `
    <main>
        <div class="constrained">
            <div style="min-height:400px;text-align:center">
                <h1 class="h1">Rant Stats Popout Page</h1>
                <p>This page is used by the Rant Stats Extension to display Rants in the popup window.</p>
                <p>To view paid Rants, visit a livestream and click the View Rants button.</p>
                ${errorDivHTML}
            </div>
        </div>
    </main>
    `

    document.title = 'Rant Stats Popout Page'

    if (!validVideoId) {
        return false
    } else if (videoId !== null) {
        // display rant
        getStream(videoId)
                .then((streamData) => {
                    if (streamData.title) {
                        document.title = `Rants | ${streamData.title}`
                    } else {
                        document.title = 'Rants'
                    }
                })
        addRantStatsSidebar(videoId, true, cacheValue).then()
    }

    return true
}
