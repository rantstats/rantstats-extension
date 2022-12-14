/**
 * Rumble chat message stream details
 */
export type RumbleChat = {
    /**
     * ID of video/chat stream
     */
    id: string,
}

/**
 * Object for the message block data
 */
export type RumbleBlockData = {
    /**
     * Test of message block
     */
    text: string,
}

/**
 * Object containing the message block
 */
export type RumbleBlock = {
    /**
     * Type of block
     */
    type: string,
    /**
     * Rumble block data
     */
    data: RumbleBlockData,
}

/**
 * Object containing the paid Rumble Rant details
 */
export type RumbleRant = {
    /**
     * Duration to display Rant in milliseconds
     */
    duration: number,
    /**
     * Date Rant expires
     */
    expires_on: string,
    /**
     * Price of rant in US cents
     */
    price_cents: number,
}

/**
 * Object containing the Rumble chat message
 */
export type RumbleMessage = {
    /**
     * Chat message ID
     */
    id: string,
    /**
     * Time message was posted
     */
    time: string,
    /**
     * User ID who made the comment
     */
    user_id: string,
    /**
     * Text of message
     */
    text: string,
    /**
     * Array of message blocks
     */
    blocks: Array<RumbleBlock>,
    /**
     * Optional paid Rant information
     */
    rant?: RumbleRant,
}

/**
 * Rumble user details
 */
export type RumbleUser = {
    /**
     * Rumble user ID
     */
    id: string,
    /**
     * Username for user
     */
    username: string,
    /**
     * Optional path to profile image
     */
    "image.1"?: string
}

/**
 * Color data for the Rumble Rant level
 */
export type RumbleRantLevelColor = {
    /**
     * Font color name
     */
    fg: string,
    /**
     * Main background color
     */
    main: string,
    /**
     * Header background color
     */
    bg2: string,
}

/**
 * Object containing the Rumble Rant level data
 */
export type RumbleRantLevel = {
    /**
     * Minimum amount of Rant in US dollars for this level
     */
    price_dollars: number,
    /**
     * How long the Rant should be shown in seconds
     */
    duration: number,
    /**
     * Color data for this level
     */
    colors: RumbleRantLevelColor
}

/**
 * Configuration for Rants
 */
export type RantsConfig = {
    /**
     * Array of level configuration objects
     */
    levels: Array<RumbleRantLevel>,
}

/**
 * Rumble config object
 */
export type RumbleConfig = {
    /**
     * Rant configuration
     */
    rants: RantsConfig,
}

/**
 * Base object for Rumble 'data' field
 */
export type RumbleDataBase = {
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
 * Object for Rumble 'init' 'data' field
 */
export type RumbleInitData = RumbleDataBase & {
    /**
     * The Rumble chat stream message data
     */
    chat: RumbleChat
    /**
     * The Rumble chat configuration data
     */
    config: RumbleConfig,
}

/**
 * Object for Rumble 'messages' 'data' field
 */
export type RumbleMessagesData = RumbleDataBase & {
    // no custom fields
}

/**
 * Type of Rumble message events
 */
export enum RumbleEventType {
    init = 'init',
    messages = 'messages',
}

/**
 * Base object for Rumble message stream events
 */
export type RumbleEventBase = Event & {
    /**
     * The event type
     */
    type: RumbleEventType,
    /**
     * Time (in milliseconds) since stream opened
     */
    timeStamp: number
}

/**
 * Object for Rumble message stream 'init' events
 */
export type RumbleEventInit = RumbleEventBase & {
    /**
     * Received init data
     */
    data: RumbleInitData,
}

/**
 * Object for Rumble message stream 'messages' events
 */
export type RumbleEventMessages = RumbleEventBase & {
    /**
     * Received message data
     */
    data: RumbleMessagesData,
    /**
     * Unique request identifier
     */
    request_id: string,
}

