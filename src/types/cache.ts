/**
 * Object for storing the Rant price
 */
export type Rant = {
    /**
     * Amount of Rant in US cents
     */
    price_cents: number
}

/**
 * Object for storing notification information
 */
export type Notification = {
    /**
     * Name of badge for notification
     */
    badge: string
    /**
     * Text of notification
     */
    text: string
    /**
     * Indicates if notification was marked Read independent of any associated Rant
     */
    read?: boolean
}

/**
 * Object for storing and managing a received Rumble Rant
 */
export type CachedRant = {
    /**
     * ID of the chat
     */
    id: string
    /**
     * Time rant was posted
     */
    time: string
    /**
     * ID of the user who made the Rant
     */
    user_id: string
    /**
     * Text of the Rant message
     */
    text: string
    /**
     * Username of the user who made the Rant
     */
    username?: string
    /**
     * Rant data
     */
    rant?: Rant
    /**
     * Notification associated with message
     */
    notification?: Notification
    /**
     * Badges associated with user who sent Rant
     */
    badges?: Array<string>
    /**
     * Indicates if Rant was marked Read
     */
    read?: boolean
}

/**
 * Object for storing and manging a cached stream
 */
export type CachedStream = {
    /**
     * Video ID
     */
    videoId: string
    /**
     * Title of the video
     */
    title: string
    /**
     * Creator of the video
     */
    creator: string
    /**
     * First time video was cached (may not align with Stream start time)
     */
    time: string
    /**
     * URL to video page
     */
    url: string
    /**
     * URL to creator's user page
     */
    creatorUrl: string
    /**
     * List of all paid Rants
     */
    rants: Array<CachedRant>
}

/**
 * Object for storing and managing user data
 */
export type CacheUser = {
    /**
     * User ID
     */
    id: string
    /**
     * User's username
     */
    username: string
    /**
     * URL to user's profile image
     */
    image: string
}

/**
 * Object for storing cache definitions
 */
export type CacheBadge = {
    /**
     * Name of badge
     */
    name: string
    /**
     * Badge icon
     */
    icon: string
    /**
     * Tooltip for Badge
     */
    label: string
}

/**
 * Object for reporting on extension data usage
 */
export type Usage = {
    /**
     * Number of bytes stored
     */
    inUse: number
    /**
     * Maximum number of bytes allowed to be stored. Ignored when running with `unlimitedStorage` permission.
     */
    total: number
    /**
     * Percentage of storage in use (inUse / total)
     */
    percentage: number
}
