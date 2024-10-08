import { setLastSortOrder, sortChats } from "./components/rants/rant"
import { updateAlternateColorsStyle, updateThemeStyle } from "./theme"
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
    if (options?.alternateColors !== undefined) {
        updateAlternateColorsStyle(options.alternateColors)
    }
}
