export type Message = {
    action: Messages
    data?: {
        [key: string]: unknown
    }
}

export enum Messages {
    /**
     * Open options page
     */
    OPEN_OPTIONS,
    OPTIONS_SAVED,
    OPEN_RANTS,
    PAGE_LOADED,
    PAGE_UNLOADED,
    OPTIONS_SAVED_TAB,
    RUMBLE_THEME_CHANGED,
    RUMBLE_THEME_CHANGED_TAB,
}
