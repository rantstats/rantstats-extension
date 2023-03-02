import {CHAT_POPUP_REGEX} from "../../types/consts";

/**
 * Get video ID from Rumble page HTML
 *
 * @return id of video
 */
export const getVideoID = (): string => {
    const m = CHAT_POPUP_REGEX.exec(window.location.pathname)
    if (m != null){
        return m[1]
    }

    const foundIds = []
    const idElements = document.querySelectorAll('[data-id]')
    idElements.forEach((element) => {
        if (
                element.classList.contains("rumbles-vote") &&
                element.getAttribute('data-type') === '1'
        ) {
            foundIds.push(element.getAttribute('data-id'))
        }
    })
    if (foundIds.length > 0) {
        return foundIds[0]
    } else {
        return ""
    }
}
