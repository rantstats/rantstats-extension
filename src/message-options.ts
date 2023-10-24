import { setPreserveMessageData } from "./components/chat-watcher/chat-watcher"
import { setMutedWords } from "./components/chat-watcher/muted-words"
import { setLastSortOrder, sortChats } from "./components/rants/rant"
import { updateThemeStyle } from "./theme"
import { Messages } from "./types/messages"
import { Options, SortOrder, Theme } from "./types/option-types"

/**
 * Handle receiving message {@link Messages.OPTIONS_SAVED_TAB}
 *
 * Resorts Rants and changes Theme to match new values
 * @param options update option values
 */
export const handleUpdateOptions = (options: Options): void => {
    // resort open pages
    if (options?.sortOrder !== undefined) {
        setLastSortOrder(options.sortOrder as SortOrder)
        sortChats()
    }
    if (options?.theme !== undefined) {
        updateThemeStyle(options.theme as Theme)
    }
    if (options?.showDeletedChats !== undefined) {
        setPreserveMessageData(options.showDeletedChats)
    }
    if (options?.hideMutedWords !== undefined && options?.customMutedWords !== undefined) {
        setMutedWords(options.hideMutedWords, options.customMutedWords, options.muteInChat, options.muteInRantStats)
    }
}
