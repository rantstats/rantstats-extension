import {CHAT_POPUP_REGEX} from "./types/consts";
import {defaultOptions, Options, SortOrder, Theme} from "./types/option-types";

/**
 * Object for storing the Rant price
 */
export type Rant = {
    /**
     * Amount of Rant in US cents
     */
    price_cents: number,
}

/**
 * Object for storing and managing a received Rumble Rant
 */
export type CachedRant = {
    /**
     * ID of the chat
     */
    id: string,
    /**
     * Time rant was posted
     */
    time: string,
    /**
     * ID of the user who made the Rant
     */
    user_id: string,
    /**
     * Text of the Rant message
     */
    text: string,
    /**
     * Username of the user who made the Rant
     */
    username?: string,
    /**
     * Rant data
     */
    rant?: Rant,
    /**
     * Indicates if Rant was marked Read
     */
    read?: boolean,
}

/**
 * Object for storing and manging a cached stream
 */
export type CachedStream = {
    /**
     * Video ID
     */
    videoId: string,
    /**
     * Title of the video
     */
    title: string,
    /**
     * Creator of the video
     */
    creator: string,
    /**
     * First time video was cached (may not align with Stream start time)
     */
    time: string,
    /**
     * URL to video page
     */
    url: string,
    /**
     * URL to creator's user page
     */
    creatorUrl: string,
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
    id: string,
    /**
     * User's username
     */
    username: string,
    /**
     * URL to user's profile image
     */
    image: string,
}

/**
 * Object for reporting on extension data usage
 */
export type Usage = {
    /**
     * Number of bytes stored
     */
    inUse: number,
    /**
     * Maximum number of bytes allowed to be stored. Ignored when running with `unlimitedStorage` permission.
     */
    total: number,
    /**
     * Percentage of storage in use (inUse / total)
     */
    percentage: number,
}

/**
 * Get the current Usage data
 *
 * @return current usage data
 */
export const getUsage = (): Promise<Usage> => {
    const total = chrome.storage.local.QUOTA_BYTES
    return chrome.storage.local.getBytesInUse()
            .then((bytesInUse) => {
                const percentage = (bytesInUse / total) * 100

                const usage: Usage = {
                    inUse: bytesInUse,
                    total: total,
                    percentage: percentage,
                }
                return usage
            })
}

/**
 * Get all stored data
 *
 * @return stored data
 */
const getAll = (): Promise<{ [key: string]: any }> => {
    // noinspection TypeScriptValidateTypes
    // @ts-ignore
    return chrome.storage.local.get(null)
}

// region Option

/**
 * Get saved options
 *
 * @param defaultValues options to return if no options currently saved
 * @return saved option data
 */
export const getOptions = (defaultValues: Options = undefined): Promise<Options> => {
    if (defaultValues === undefined) {
        defaultValues = {} as Options
    }
    return chrome.storage.local.get({
        options: defaultValues
    })
            .then((options) => {
                return options.options as Options
            })
}

/**
 * Get sort order option value
 *
 * @return sort order option value
 */
export const getSortOrder = (): Promise<SortOrder> => {
    return getOptions({sortOrder: defaultOptions.sortOrder} as Options)
            .then((options: Options) => {
                return options.sortOrder as SortOrder
            })
}

/**
 * Get theme option value
 *
 * @return theme option value
 */
export const getTheme = (): Promise<Theme> => {
    return getOptions({theme: defaultOptions.theme} as Options)
            .then((options: Options) => {
                return options.theme as Theme
            })
}

/**
 * Get number of days to keep data option value
 *
 * @return number of days to keep data option value
 */
const getHistoryDays = (): Promise<number> => {
    return getOptions({historyDays: defaultOptions.historyDays} as Options)
            .then((options: Options) => {
                return options.historyDays
            })
}

/**
 * Get option indicating if data should be opened in a popup instead of sidebar
 *
 * @return flag indicating if popup should be used instead of sidebar
 */
export const getOpenAsPopup = (): Promise<boolean> => {
    return getOptions({asPopup: defaultOptions.asPopup} as Options)
            .then((options: Options) => {
                const m = CHAT_POPUP_REGEX.exec(window.location.pathname)
                if (m != null) {
                    return true
                }
                return options.asPopup
            })
}

// endregion Option

/**
 * Get the last sidebar width used previously
 *
 * @return width of sidebar in pixels
 */
export const getLastWidth = (): Promise<number> => {
    return chrome.storage.local.get({width: 400})
            .then((data: { width: number }) => {
                return data.width
            })
}

/**
 * Set the last sidebar width
 *
 * @param width width of sidebar in pixels
 */
export const setLastWidth = (width: number): Promise<void> => {
    return chrome.storage.local.set({width: width})
            .then()
}

/**
 * Remove cached streams older than the history option.
 *
 * If time of stream unknown, assumed to be older than cutoff
 */
export const cleanHistory = async () => {
    const historyDays = await getHistoryDays()
    const cutOffTime = new Date().getTime() - (historyDays * 24 * 60 * 60 * 1000) // historyDays days ago
    getAllStreams()
            .then((streams) => {
                const toRemove: Array<any> = ['vundefined']
                streams.forEach((stream) => {
                    const time = stream.time
                    if (time === "" || time === undefined) {
                        toRemove.push(getStreamKey(stream.videoId))
                    } else {
                        const streamDate = new Date(time)
                        if (streamDate.getTime() < cutOffTime) {
                            toRemove.push(getStreamKey(stream.videoId))
                        }
                    }
                })
                if (toRemove.length) {
                    chrome.storage.local.remove(toRemove)
                            .then()
                }
            })
}

/**
 * Helper for getting the stream key used to save stream data to storage
 *
 * @param videoId id of the video
 * @return key for the saved stream data
 */
const getStreamKey = (videoId: string): string => {
    return `v${videoId}`
}

/**
 * Get the saved stream data for the specified video ID
 *
 * @param videoId id of the video to get
 * @return saved stream data
 */
export const getStream = (videoId: string): Promise<CachedStream> => {
    const streamKey = getStreamKey(videoId)
    return chrome.storage.local.get(streamKey)
            .then((cachedStream: { [id: string]: CachedStream }) => {
                return cachedStream[streamKey]
            })
}

/**
 * Save the stream data
 *
 * @param streamData stream data to save
 */
const saveStream = (streamData: CachedStream): Promise<void> => {
    return chrome.storage.local.set(
            {
                [getStreamKey(streamData.videoId)]: streamData
            }
    )
            .then()
}

/**
 * Helper for updating one or more keys in the stream data.
 *
 * The {@link CachedStream.time} value will not be overwritten.
 *
 * For the {@link CachedStream.rants}, the current and new data will be combined.
 *
 * @param videoId id of the video to update
 * @param data data to save. Key options are those in the {@link CachedStream}
 */
const updateStream = (
        videoId: string,
        data: { [key: string]: any }
): Promise<void> => {
    return getStream(videoId)
            .then((cachedStream: CachedStream) => {
                if (cachedStream === undefined) {
                    // new stream, just save
                    cachedStream = data as CachedStream
                } else {
                    for (const key in data) {
                        // special handler for rants
                        if (key === 'rants') {
                            cachedStream[key] = joinRants(cachedStream[key], data[key])
                        } else if (key === 'time') {
                            // only update time if time doesn't already exist
                            if (cachedStream[key] === '') {
                                cachedStream[key] = data[key]
                            }
                        } else {
                            cachedStream[key] = data[key]
                        }
                    }
                }

                // save data back to storage
                saveStream(cachedStream)
                        .then()
            })
}

/**
 * Remove the specified video from the saved data
 *
 * @param videoId id of the video to remove
 */
export const removeStream = (videoId: string): Promise<void> => {
    const streamKey = getStreamKey(videoId)
    return chrome.storage.local.remove(streamKey)
            .then()
}

/**
 * Helper for combining 2 lists of Rants.
 *
 * Only keep Rants with unique {@link CachedRant.id} values.
 *
 * @param cachedRants list of Rants from the cache
 * @param newRants list of new Rants
 * @return combined list of Rants
 */
const joinRants = (cachedRants: Array<CachedRant>, newRants: Array<CachedRant>): Array<CachedRant> => {
    let combinedRants: Array<CachedRant> = cachedRants

    newRants.forEach((rant) => {
        let existing = combinedRants.find((r) => {
            return r.id == rant.id
        })

        if (existing === undefined) {
            combinedRants.push(rant)
        } else {
            for (const key in rant) {
                existing[key] = rant[key]
            }

        }
    })

    return combinedRants
}

/**
 * Save the stream data
 *
 * @param cacheData the stream data to save
 */
export const cacheStream = (cacheData: CachedStream): Promise<void> => {
    return updateStream(cacheData.videoId, cacheData)
            .then()
}

/**
 * Get all previously saved streams
 *
 * @return list of previously saved streams
 */
export const getAllStreams = (): Promise<Array<CachedStream>> => {
    return getAll()
            .then((items: { [key: string]: any }) => {
                const streams: Array<CachedStream> = []
                for (const key in items) {
                    if (/^v\d+$/gm.test(key)) {
                        streams.push(items[key])
                    }
                }
                return streams
            })
}

/**
 * Get all previously cached video ids
 *
 * @return list of video ids
 */
export const getAllVideoIs = (): Promise<Array<string>> => {
    return getAllStreams()
            .then((streams) => {
                return streams.map((stream) => stream.videoId)
            })
}

/**
 * Save the specified Rant to the stream data for the specified video
 *
 * @param videoId id of the video to save Rant to
 * @param cachedRant the Rant data
 */
export const cacheMessage = (videoId: string, cachedRant: CachedRant): Promise<void> => {
    return updateStream(videoId, {rants: [cachedRant]})
            .then()
}

/**
 * Update a previously saved Rant in the video
 *
 * @param videoId id of the video to update Rant in
 * @param messageId id of the Rant to update
 * @param data data to save. Key options are those in the {@link CachedRant}
 */
export const updateCachedMessage = (
        videoId: string,
        messageId: string,
        data: { [key: string]: any }
): Promise<void> => {
    return updateStream(
            videoId,
            {
                rants: [
                    {
                        id: messageId,
                        ...data
                    }
                ]
            }
    )
            .then()
}

/**
 * Get the message ids for all Rants saved for the video
 *
 * @param videoId id of the video to get Rants in
 * @return list of Rant ids
 */
export const getAllCachedMessageIds = (videoId: string): Promise<Array<string>> => {
    return getAllCachedMessages(videoId)
            .then((rants: Array<CachedRant>) => {
                return rants.map((rant) => rant.id)
            })
}

/**
 * Get all previously saved Rants for the video
 *
 * @param videoId id of the video to get Rants in
 * @return list of previously saved Rants
 */
export const getAllCachedMessages = (videoId: string): Promise<Array<CachedRant>> => {
    return getStream(videoId)
            .then((cachedStream: CachedStream) => {
                if (cachedStream === undefined) {
                    return []
                } else {
                    return cachedStream.rants
                }
            })
}

/**
 * Get all saved user data
 *
 * @return list of user data
 */
export const getUsers = (): Promise<Array<CacheUser>> => {
    return chrome.storage.local.get({users: [],})
            .then((data: { users: Array<CacheUser> }) => {
                return data.users
            })
}

/**
 * Get saved user data for the specified id
 *
 * @param userId id of the user
 * @return saved user data
 */
export const getUser = (userId: string): Promise<CacheUser> => {
    return getUsers()
            .then((users) => {
                return users.find((user) => user.id === userId)
            })
}

/**
 * Save users to storage
 *
 * @param users list of user data
 */
const saveUsers = (users: Array<CacheUser>): Promise<void> => {
    return chrome.storage.local.set({users: users})
            .then()
}

/**
 * Update one or more keys for the user
 *
 * @param userId id of the user to update
 * @param data data to save. Key options are those in the {@link CacheUser}
 */
export const updateUser = (userId: string, data: { [key: string]: any }): Promise<void> => {
    return getUsers()
            .then((users) => {
                const matchingUser = users.find((user) => user.id === userId)

                if (matchingUser === undefined) {
                    users.push(data as CacheUser)
                } else {
                    for (const key in matchingUser) {
                        matchingUser[key] = data[key]
                    }
                }

                // save user data back
                saveUsers(users)
                        .then()
            })
}
