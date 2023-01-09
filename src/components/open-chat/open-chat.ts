import {getOpenAsPopup} from "../../cache";
import {updateChatThemeStyle} from "../../theme";
import {CHAT_BUTTON_DIV_ID, CHAT_BUTTON_ID, SIDEBAR_ID} from "../../types/consts";
import {addRantStatsSidebar, openRantPopout, popoutSidebar} from "../rants/rants";
import {initStreamCache} from "../rumble/stream-handler";

/**
 * Helper for getting the chat button element
 *
 * @return chat button element
 */
const getChatButton = (): HTMLElement => {
    return document.getElementById(CHAT_BUTTON_ID) as HTMLElement
}

/**
 * Add the chat button to the page
 *
 * @param onclick function to call when chat button clicked
 * @return true: button added
 */
export const addChatButton = (onclick: () => void): boolean => {
    const rantList = document.getElementById('chat-sticky-rants') as HTMLUListElement
    if (rantList === null) {
        return false
    }

    const listItem = document.createElement('li') as HTMLLIElement
    listItem.id = CHAT_BUTTON_ID
    listItem.classList.add('chat-history--rant-sticky')
    listItem.style.position = 'relative'
    listItem.style.overflow = 'hidden'
    listItem.setAttribute('data-level', '500')

    listItem.onclick = onclick
    listItem.title = 'Open Rant Stats'

    const pillDivItem = document.createElement('div') as HTMLDivElement
    pillDivItem.classList.add('chat-history--rant-sticky--pill')
    pillDivItem.style.background = '#bb0218'
    listItem.appendChild(pillDivItem)

    const imageItem = document.createElement('div') as HTMLDivElement
    imageItem.classList.add('chat--profile-pic')
    imageItem.style.position = 'relative'
    imageItem.style.marginRight = '0.25rem'
    imageItem.style.backgroundColor = '#37c'
    imageItem.style.backgroundImage = `url(${chrome.runtime.getURL("images/dollar.svg")})`
    imageItem.setAttribute('data-small', '')
    pillDivItem.appendChild(imageItem)

    const textItem = document.createElement('div') as HTMLDivElement
    textItem.classList.add('chat-history--rant-price')
    textItem.style.position = 'relative'
    textItem.textContent = 'Rants'
    pillDivItem.appendChild(textItem)

    const wellDivItem = document.createElement('div') as HTMLDivElement
    wellDivItem.classList.add('chat-history--rant-progressbar--well')
    listItem.appendChild(wellDivItem)

    const progressBarDivItem = document.createElement('div') as HTMLDivElement
    progressBarDivItem.classList.add('chat-history--rant-progressbar')
    progressBarDivItem.style.width = '100%'
    wellDivItem.appendChild(progressBarDivItem)

    rantList.insertBefore(listItem, rantList.firstChild)
    return true
}

/**
 * Add the cache button to the page
 *
 * @param onclick function to call when cache button clicked
 * @return true: button added
 */
export const addCacheButton = (onclick: () => void): boolean => {
    // get related videos list
    const mediaLists = document.getElementsByClassName('mediaList-list')
    if (mediaLists.length === 0) {
        return false
    }
    const relatedLists = Array.from(mediaLists).filter((r) => r.classList.contains('related'))
    if (relatedLists.length === 0) {
        return false
    }
    const relatedList = relatedLists[0]

    const chatButtonDiv = document.createElement('div') as HTMLDivElement
    chatButtonDiv.id = CHAT_BUTTON_DIV_ID
    chatButtonDiv.classList.add('container')
    chatButtonDiv.classList.add('content')

    const chatButton = document.createElement('p') as HTMLParagraphElement
    chatButton.id = CHAT_BUTTON_ID
    // chatButton.classList.add('mediaList-item')
    chatButton.classList.add('first-item')
    chatButton.onclick = onclick
    chatButtonDiv.appendChild(chatButton)

    const imageHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path d="M12.324 7.021l.154.345c.237-.041.52-.055.847-.025l.133.577c-.257-.032-.53-.062-.771-.012l-.092.023c-.464.123-.316.565.098.672.682.158 1.494.208 1.815.922.258.578-.041.973-.541 1.163l.154.346-.325.068-.147-.329c-.338.061-.725.053-1.08-.041l-.1-.584c.294.046.658.087.938.03l.186-.06c.333-.165.231-.582-.264-.681-.367-.083-1.342-.021-1.705-.831-.205-.458-.053-.936.535-1.154l-.161-.361.326-.068m3.82 1.614c-.706-1.648-2.681-2.751-4.409-2.463-1.728.288-2.557 1.857-1.85 3.506.746 1.739 2.888 2.853 4.651 2.414 1.562-.388 2.28-1.887 1.608-3.457zm4.05-5.635l3.766 8.233c-5.433 4.223-12.654-.038-17.951 4.461l-3.766-8.233c4.944-4.779 11.773-.45 17.951-4.461zm3.806 12.014c-6.857 3.939-12.399-1.424-19.5 5.986l-4.5-9.964 1.402-1.462 3.807 8.401-.002.008c7.445-5.592 11.195-1.175 18.109-4.561.294.647.565 1.33.684 1.592z"/>
        </svg>
    `
    chatButton.insertAdjacentHTML('afterbegin', imageHTML)

    const paragraphText = document.createElement('span') as HTMLSpanElement
    paragraphText.textContent = 'Open Cached Rants'
    chatButton.appendChild(paragraphText)

    relatedList.parentNode.insertBefore(chatButtonDiv, relatedList)

    updateChatThemeStyle()

    return true
}

/**
 * Set the chat button enable/disable state
 *
 * @param enabled true: enable button
 */
export const setChatButtonEnable = (enabled: boolean) => {
    const chatButton = getChatButton()
    if (chatButton === null) {
        return
    }

    if (enabled) {
        chatButton.classList.remove('disabled')
    } else {
        chatButton.classList.add('disabled')
    }

}

/**
 * Handler for opening sidebar or popup
 *
 * @param videoId id of the video
 * @param cache true: button handle for cache
 */
export const openRantsButtonHandler = async (videoId: string, cache: boolean = false) => {
    initStreamCache(videoId)
    if (await getOpenAsPopup()) {
        const existingSidebar = document.getElementById(SIDEBAR_ID)
        if (existingSidebar === null) {
            openRantPopout(videoId, cache)
        } else {
            popoutSidebar()
        }
    } else {
        await addRantStatsSidebar(videoId, false, cache)
    }
}

