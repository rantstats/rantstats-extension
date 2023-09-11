/**
 * Rumble chat message stream details
 */
export type RumbleChat = {
    /**
     * ID of video/chat stream
     */
    id: string
}

/**
 * Object for the message block data
 */
export type RumbleBlockData = {
    /**
     * Test of message block
     */
    text: string
}

/**
 * Object containing the message block
 */
export type RumbleBlock = {
    /**
     * Type of block
     */
    type: string
    /**
     * Rumble block data
     */
    data: RumbleBlockData
}

/**
 * Object containing the paid Rumble Rant details
 */
export type RumbleRant = {
    /**
     * Duration to display Rant in milliseconds
     */
    duration: number
    /**
     * Date Rant expires
     */
    expires_on: string
    /**
     * Price of rant in US cents
     */
    price_cents: number
}

/**
 * Object containing the Rumble notification information
 */
export type RumbleNotification = {
    /**
     * Name of badge for notification
     */
    badge: string
    /**
     * Text of notification
     */
    text: string
}

/**
 *
 */
export type RumbleChannel = {
    /**
     * The ID of the channel
     */
    id: string
    /**
     * URL slug for accessing the channel's profile. Usually appended to https://rumble.com
     */
    link: string
    /**
     * Username for channel
     */
    username: string
}

/**
 * Object containing the Rumble chat message
 */
export type RumbleMessage = {
    /**
     * Chat message ID
     */
    id: string
    /**
     * Time message was posted
     */
    time: string
    /**
     * User ID who made the comment
     */
    user_id: string
    /**
     * Text of message
     */
    text: string
    /**
     * Array of message blocks
     */
    blocks: Array<RumbleBlock>
    /**
     * Optional paid Rant information
     */
    rant?: RumbleRant
    /**
     * Optional notification information (ex: monthly subscriber)
     */
    notification?: RumbleNotification
}

/**
 * Rumble user details
 */
export type RumbleUser = {
    /**
     * Rumble user ID
     */
    id: string
    /**
     * Username for user
     */
    username: string
    /**
     * User's color in chat
     */
    color: string
    /**
     * Array of badge names associated with user
     */
    badges?: Array<string>
    /**
     * Optional path to profile image
     */
    "image.1"?: string
    /**
     * Indicates user is a follower of the channel or not
     */
    is_follower: boolean
    /**
     * URL slug for accessing the user's profile. Usually appended to https://rumble.com
     */
    link: string
}

/**
 * Color data for the Rumble Rant level
 */
export type RumbleRantLevelColor = {
    /**
     * Font color name
     */
    fg: string
    /**
     * Main background color
     */
    main: string
    /**
     * Header background color
     */
    bg2: string
}

/**
 * Object containing the Rumble Rant level data
 */
export type RumbleRantLevel = {
    /**
     * Minimum amount of Rant in US dollars for this level
     */
    price_dollars: number
    /**
     * How long the Rant should be shown in seconds
     */
    duration: number
    /**
     * Color data for this level
     */
    colors: RumbleRantLevelColor
    /**
     * Array of ids associated with rant level
     */
    ids: Array<string>
}

/**
 * Configuration for Rants
 */
export type RantsConfig = {
    /**
     * Indicates if rants are enabled
     */
    enable: boolean
    /**
     * Array of level configuration objects
     */
    levels: Array<RumbleRantLevel>
}

/**
 * Rumble badge icons object
 */
export type RumbleBadgeIcons = {
    /**
     * Size of badge icon (multiple with different sizes)
     */
    [key: number]: string
}

/**
 * Rumble badge labels object
 */
export type RumbleBadgeLabel = {
    /**
     * Description of badge in English
     *
     * Note: likely other values, but have only seen "en" so far
     */
    en: string
}

/**
 * Rumble badge object
 */
export type RumbleBadge = {
    /**
     * Badge icon data
     */
    icons: RumbleBadgeIcons
    /**
     * Badge label data
     */
    label: RumbleBadgeLabel
}

/**
 * Rumble Badges object
 *
 * Keys are the badge name
 */
export type RumbleBadges = {
    [key: string]: RumbleBadge
}

/**
 * Rumble Subscription properties
 */
export type RumbleSubscription = {
    /**
     * Is subscriptions enabled
     */
    enable: boolean
}

/**
 * Rumble config object
 */
export type RumbleConfig = {
    /**
     * Rant configuration
     */
    rants: RantsConfig
    /**
     * All possible badges
     */
    badges: RumbleBadges
    /**
     * Maximum length of messages
     */
    message_length_max: number
    /**
     * Subscription data
     */
    subscription: RumbleSubscription
}

/**
 * Base object for Rumble 'data' field
 */
export type RumbleDataBase = {
    /**
     * Array of logged in users' channel data
     */
    channels: Array<RumbleChannel>
    /**
     * Array of Rumble message objects
     */
    messages: Array<RumbleMessage>
    /**
     * Array of Rumble user objects
     */
    users: Array<RumbleUser>
}

/**
 * Object for Rumble {@link RumbleEventType.init} 'data' field
 */
export type RumbleInitData = RumbleDataBase & {
    /**
     * The Rumble chat stream message data
     */
    chat: RumbleChat
    /**
     * The Rumble chat configuration data
     */
    config: RumbleConfig
}

/**
 * Object for Rumble {@link RumbleEventType.messages} 'data' field
 */
export type RumbleMessagesData = RumbleDataBase & {
    // no custom fields
}

/**
 * Object for Rumble {@link RumbleEventType.mute_users} 'data' field
 */
export type RumbleMuteData = {
    /**
     * List of user ids to mute
     */
    user_ids: Array<string>
}

/**
 * Object for Rumble {@link RumbleEventType.delete_non_rant_messages} 'data' field
 */
export type RumbleDeleteNonRantMessagesData = {
    /**
     * List of message ids to delete
     */
    message_ids: Array<string>
}

/**
 * Type of Rumble message events
 */
export enum RumbleEventType {
    delete_non_rant_messages = "delete_non_rant_messages",
    init = "init",
    messages = "messages",
    mute_users = "mute_users",
}

/**
 * Base object for Rumble message stream events
 */
export type RumbleEventBase = Event & {
    /**
     * The event type
     */
    type: RumbleEventType
    /**
     * Time (in milliseconds) since stream opened
     */
    timeStamp: number
}

/**
 * Object for Rumble message stream {@link RumbleEventType.init} events
 */
export type RumbleEventInit = RumbleEventBase & {
    /**
     * Received init data
     */
    data: RumbleInitData
}

/**
 * Object for Rumble message stream {@link RumbleEventType.messages} events
 */
export type RumbleEventMessages = RumbleEventBase & {
    /**
     * Received message data
     */
    data: RumbleMessagesData
    /**
     * Unique request identifier
     */
    request_id: string
}

/**
 * Object for Rumble message stream {@link RumbleEventType.mute_users} events
 */
export type RumbleEventMuteUsers = RumbleEventBase & {
    /**
     * Received init data
     */
    data: RumbleMuteData
}

/**
 * Object for Rumble message stream {@link RumbleEventType.delete_non_rant_messages} events
 */
export type RumbleDeleteNonRantMessages = RumbleEventBase & {
    /**
     * Received init data
     */
    data: RumbleDeleteNonRantMessagesData
}
