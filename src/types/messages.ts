/**
 * Enumeration of all message/actions
 */
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

/**
 * Message to send to/from extension background
 */
export type Message = {
    /**
     * Action/message to perform
     */
    action: Messages
    /**
     * Data associated with action
     */
    data?: {
        [key: string]: unknown
    }
}
