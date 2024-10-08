import { getOpenAsPopup } from "../../cache"
import { updateChatThemeStyle } from "../../theme"
import { CONSTS } from "../../types/consts"
import { addRantStatsSidebar, openRantPopout, popoutSidebar } from "../rants/rants"
import { initStreamCache } from "../rumble/stream-handler"

/**
 * Add the chat button to the page
 * @param onclick function to call when chat button clicked
 * @returns true: button added
 */
export const addChatButton = (onclick: () => void): boolean => {
    const chatHeaderButtons = document.getElementsByClassName(
        "chat--header-buttons-wrapper",
    ) as HTMLCollectionOf<HTMLDivElement>
    if (chatHeaderButtons.length === 0) {
        return false
    }

    const chatHeaderButton = chatHeaderButtons[0]

    const listItem = document.createElement("button") as HTMLButtonElement
    listItem.classList.add(CONSTS.CHAT_BUTTON_ID)
    listItem.classList.add("chat--header-button")
    listItem.innerHTML = `<img src="${chrome.runtime.getURL("images/dollar.svg")}" alt="Open Rant Stats"/>`

    listItem.onclick = onclick
    listItem.title = "Open Rant Stats"

    chatHeaderButton.insertBefore(listItem, chatHeaderButton.firstChild)
    return true
}

/**
 * Add the cache button to the page under specified parent section
 * @param parentClassName name or root/parent class name
 * @param onclick function to call when cache button clicked
 * @returns true: button added
 */
const addCacheButtonToNode = (parentClassName: string, onclick: () => void): boolean => {
    // get related videos list
    const relatedSidebar = document.getElementsByClassName(parentClassName)
    if (relatedSidebar.length === 0) {
        return false
    }

    const mediaLists = relatedSidebar[0].getElementsByClassName("mediaList-list")
    if (mediaLists.length === 0) {
        return false
    }
    const relatedLists = Array.from(mediaLists).filter((r) => r.classList.contains("related"))
    if (relatedLists.length === 0) {
        return false
    }
    const relatedList = relatedLists[0]

    const chatButtonDiv = document.createElement("div") as HTMLDivElement
    chatButtonDiv.classList.add(CONSTS.CHAT_BUTTON_DIV_ID)
    chatButtonDiv.classList.add("container")
    chatButtonDiv.classList.add("content")

    const chatButton = document.createElement("p") as HTMLParagraphElement
    chatButton.classList.add(CONSTS.CHAT_BUTTON_ID)
    chatButton.classList.add("first-item")
    chatButton.onclick = onclick
    chatButtonDiv.appendChild(chatButton)

    const imageHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12.324 7.021l.154.345c.237-.041.52-.055.847-.025l.133.577c-.257-.032-.53-.062-.771-.012l-.092.023c-.464.123-.316.565.098.672.682.158 1.494.208 1.815.922.258.578-.041.973-.541 1.163l.154.346-.325.068-.147-.329c-.338.061-.725.053-1.08-.041l-.1-.584c.294.046.658.087.938.03l.186-.06c.333-.165.231-.582-.264-.681-.367-.083-1.342-.021-1.705-.831-.205-.458-.053-.936.535-1.154l-.161-.361.326-.068m3.82 1.614c-.706-1.648-2.681-2.751-4.409-2.463-1.728.288-2.557 1.857-1.85 3.506.746 1.739 2.888 2.853 4.651 2.414 1.562-.388 2.28-1.887 1.608-3.457zm4.05-5.635l3.766 8.233c-5.433 4.223-12.654-.038-17.951 4.461l-3.766-8.233c4.944-4.779 11.773-.45 17.951-4.461zm3.806 12.014c-6.857 3.939-12.399-1.424-19.5 5.986l-4.5-9.964 1.402-1.462 3.807 8.401-.002.008c7.445-5.592 11.195-1.175 18.109-4.561.294.647.565 1.33.684 1.592z"/>
        </svg>
    `
    chatButton.insertAdjacentHTML("afterbegin", imageHTML)

    const paragraphText = document.createElement("span") as HTMLSpanElement
    paragraphText.textContent = "Open Cached Rants"
    chatButton.appendChild(paragraphText)

    relatedList.parentNode.insertBefore(chatButtonDiv, relatedList)

    return true
}

/**
 * Add the cache button to the page
 * @param onclick function to call when cache button clicked
 * @returns true: button added
 */
export const addCacheButton = (onclick: () => void): boolean => {
    let success = addCacheButtonToNode("media-page-related-media-desktop-sidebar", onclick)
    success &&= addCacheButtonToNode("media-page-related-media-mobile", onclick)

    updateChatThemeStyle()

    return success
}

/**
 * Handler for opening sidebar or popup
 * @param videoId id of the video
 * @param cache true: button handle for cache
 */
export const openRantsButtonHandler = async (videoId: string, cache: boolean = false): Promise<void> => {
    initStreamCache(videoId)
    if (await getOpenAsPopup()) {
        const existingSidebar = document.getElementById(CONSTS.SIDEBAR_ID)
        if (existingSidebar === null) {
            openRantPopout(videoId, cache)
        } else {
            popoutSidebar()
        }
    } else {
        await addRantStatsSidebar(videoId, false, cache)
    }
}
