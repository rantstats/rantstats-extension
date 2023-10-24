/**
 * Sort options
 */
export enum SortOrder {
    /**
     * Sort Rants by the post date from oldest to newest
     */
    OldToNew = "0",
    /**
     * Sort Rants by the post date from newest to oldest
     */
    NewToOld = "1",
    /**
     * Sort Rants by the price from high to low
     */
    HighToLow = "2",
    /**
     * Sort Rants by the price from low to high
     */
    LowToHigh = "3",
}

/**
 * Color theme options
 */
export enum Theme {
    /**
     * Follow the theme of Rumble.com
     */
    Rumble = "0",
    /**
     * Follow the system's theme settings
     */
    System = "1",
    /**
     * Always use dark mode
     */
    Dark = "2",
    /**
     * Always use light mode
     */
    Light = "3",
}

/**
 * Options
 */
export type Options = {
    /**
     * How Rants should be sorted.
     * Saved as string but should be cast to {@link SortOrder}
     */
    sortOrder: string // SortOrder
    /**
     * The number of days to keep stream in cache
     */
    historyDays: number
    /**
     * Color theme to use.
     * Saved as string but should be cast to {@link Theme}
     */
    theme: string // Theme
    /**
     * Open Rants in popup instead of sidebar
     */
    asPopup: boolean
    /**
     * Show deleted chats in chat
     */
    showDeletedChats: boolean
    /**
     * Show muted users in chat
     */
    showMutedUsers: boolean
    /**
     * Hide chat messages and Rumble Rants containing the muted text
     */
    hideMutedWords: boolean
    /**
     * Words/phrases to hide from chat and Rumble Rants
     */
    customMutedWords: Array<string>
    /**
     * Mute chat messages and Rumble Rants in chat
     */
    muteInChat: boolean
    /**
     * Mute Rumble Rants in Rant Stats sidebar/popout
     */
    muteInRantStats: boolean
}

/**
 * Default options to use
 */
export const defaultOptions: Options = {
    sortOrder: SortOrder.NewToOld.toString(),
    historyDays: 30,
    theme: Theme.Rumble.toString(),
    asPopup: false,
    showDeletedChats: false,
    showMutedUsers: false,
    hideMutedWords: false,
    customMutedWords: [],
    muteInChat: true,
    muteInRantStats: true,
}
