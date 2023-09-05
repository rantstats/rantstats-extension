import { getStream } from "../../cache"
import { CONSTS } from "../../types/consts"

/**
 * Setup page if viewed in popup
 * @param videoId id of video
 * @returns true: opened in popup
 */
export const setupPopup = (videoId: string): boolean => {
    const sidebar = document.getElementById(CONSTS.SIDEBAR_ID) as HTMLHeadingElement
    if (sidebar === null) {
        return false
    }
    const popup = sidebar.classList.contains(CONSTS.POPUP_CLASS)

    if (popup) {
        document.documentElement.style.overflow = "hidden"
        const sidebarTitleHeader = document.getElementById(CONSTS.SIDEBAR_TITLE_ID) as HTMLHeadingElement
        if (sidebarTitleHeader) {
            getStream(videoId).then((streamData) => {
                if (streamData.title) {
                    sidebarTitleHeader.textContent = streamData.title
                } else {
                    sidebarTitleHeader.textContent = "Rant Stats"
                }
            })
        }
    }

    return popup
}
