import { CacheBadge, CachedRant, CachedStream, CacheUser, Notification, Usage } from "./types/cache"
import { CHAT_POPUP_REGEX } from "./types/consts"
import { defaultOptions, Options, SortOrder, Theme } from "./types/option-types"

/**
 * Helper for getting the stream key used to save stream data to storage
 * @param videoId id of the video
 * @returns key for the saved stream data
 */
const getStreamKey = (videoId: string): string => {
    return `v${videoId}`
}

/**
 * Get the current Usage data
 * @returns current usage data
 */
export const getUsage = async (): Promise<Usage> => {
    const total = chrome.storage.local.QUOTA_BYTES
    const bytesInUse = await chrome.storage.local.getBytesInUse()
    const percentage = (bytesInUse / total) * 100
    return {
        inUse: bytesInUse,
        total,
        percentage,
    }
}

/**
 * Get all stored data
 * @returns stored data
 */
const getAll = (): Promise<{
    [key: string]: unknown
}> => {
    return chrome.storage.local.get()
}

/**
 * Get all previously saved streams
 * @returns list of previously saved streams
 */
export const getAllStreams = async (): Promise<Array<CachedStream>> => {
    const items = await getAll()
    const streams: Array<CachedStream> = []
    Object.keys(items).forEach((key_1) => {
        if (/^v\d+$/gm.test(key_1)) {
            streams.push(items[key_1] as CachedStream)
        }
    })
    return streams
}

// region Option

/**
 * Get saved options
 * @param defaultValues options to return if no options currently saved
 * @returns saved option data
 */
export const getOptions = async (defaultValues: Options = undefined): Promise<Options> => {
    let options = defaultValues
    if (defaultValues === undefined) {
        options = {} as Options
    }
    const returnData = await chrome.storage.local.get({
        options,
    })
    return returnData.options as Options
}

/**
 * Update the saved options with new values.
 * @param newOptions new option values
 * @returns A void promise
 */
export const updateOptions = async (newOptions: Options): Promise<void> => {
    const currentOptions = await getOptions()
    const combinedOptions: Options = {
        ...currentOptions,
        ...newOptions,
    }
    return chrome.storage.local.set({ options: combinedOptions })
}

/**
 * Get sort order option value
 * @returns sort order option value
 */
export const getSortOrder = async (): Promise<SortOrder> => {
    const options = await getOptions({ sortOrder: defaultOptions.sortOrder } as Options)
    return options.sortOrder as SortOrder
}

/**
 * Get theme option value
 * @returns theme option value
 */
export const getTheme = async (): Promise<Theme> => {
    const options = await getOptions({ theme: defaultOptions.theme } as Options)
    return options.theme as Theme
}

/**
 * Get number of days to keep data option value
 * @returns number of days to keep data option value
 */
const getHistoryDays = async (): Promise<number> => {
    const options = await getOptions({ historyDays: defaultOptions.historyDays } as Options)
    return options.historyDays
}

/**
 * Get option indicating if data should be opened in a popup instead of sidebar
 * @returns flag indicating if popup should be used instead of sidebar
 */
export const getOpenAsPopup = async (): Promise<boolean> => {
    const options = await getOptions({ asPopup: defaultOptions.asPopup } as Options)
    const m = CHAT_POPUP_REGEX.exec(window.location.pathname)
    if (m != null) {
        return true
    }
    return options.asPopup
}

// endregion Option

/**
 * Get the last sidebar width used previously
 * @returns width of sidebar in pixels
 */
export const getLastWidth = async (): Promise<number> => {
    const data = await chrome.storage.local.get({ width: 400 })
    return data.width
}

/**
 * Set the last sidebar width
 * @param width width of sidebar in pixels
 * @returns A void promise
 */
export const setLastWidth = async (width: number): Promise<void> => {
    return chrome.storage.local.set({ width })
}

/**
 * Remove cached streams older than the history option.
 *
 * If time of stream unknown, assumed to be older than cutoff
 */
export const cleanHistory = async (): Promise<void> => {
    const historyDays = await getHistoryDays()
    const cutOffTime = new Date().getTime() - historyDays * 24 * 60 * 60 * 1000 // historyDays days ago
    getAllStreams().then((streams) => {
        // noinspection SpellCheckingInspection
        const toRemove: Array<string> = ["vundefined"]
        streams.forEach((stream) => {
            const { time } = stream
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
            chrome.storage.local.remove(toRemove).then()
        }
    })
}

/**
 * Helper for combining notification info
 * @param cachedNotification cached Notification info
 * @param newNotification new or partial Notification info
 * @returns updated notification
 */
const combineNotification = (cachedNotification: Notification, newNotification: Notification): Notification => {
    if (cachedNotification === undefined) {
        return newNotification
    }
    const returnNotification = { ...cachedNotification } as Notification
    Object.keys(newNotification).forEach((key) => {
        returnNotification[key] = newNotification[key]
    })

    return returnNotification
}

/**
 * Helper for combining 2 lists of Rants.
 *
 * Only keep Rants with unique {@link CachedRant.id} values.
 * @param cachedRants list of Rants from the cache
 * @param newRants list of new Rants
 * @returns combined list of Rants
 */
const joinRants = (cachedRants: Array<CachedRant>, newRants: Array<CachedRant>): Array<CachedRant> => {
    const combinedRants: Array<CachedRant> = cachedRants

    newRants.forEach((rant) => {
        const existing = combinedRants.find((r) => {
            return r.id === rant.id
        })

        if (existing === undefined) {
            combinedRants.push(rant)
        } else {
            Object.keys(rant).forEach((key) => {
                // special handler for notifications
                if (key === "notification") {
                    existing[key] = combineNotification(existing[key], rant[key])
                } else {
                    existing[key] = rant[key]
                }
            })
        }
    })

    return combinedRants
}

/**
 * Get the saved stream data for the specified video ID
 * @param videoId id of the video to get
 * @returns saved stream data
 */
export const getStream = async (videoId: string): Promise<CachedStream> => {
    const streamKey = getStreamKey(videoId)
    const cachedStream = await chrome.storage.local.get(streamKey)
    return cachedStream[streamKey]
}

/**
 * Save the stream data
 * @param streamData stream data to save
 * @returns A void promise
 */
const saveStream = async (streamData: CachedStream): Promise<void> => {
    return chrome.storage.local.set({
        [getStreamKey(streamData.videoId)]: streamData,
    })
}

/**
 * Helper for updating one or more keys in the stream data.
 *
 * The {@link CachedStream.time} value will not be overwritten.
 *
 * For the {@link CachedStream.rants}, the current and new data will be combined.
 * @param videoId id of the video to update
 * @param data data to save. Key options are those in the {@link CachedStream}
 */
const updateStream = async (
    videoId: string,
    data: {
        [key: string]: unknown
    },
): Promise<void> => {
    let cachedStream = await getStream(videoId)
    if (cachedStream === undefined) {
        // new stream, just save
        cachedStream = data as CachedStream
    } else {
        Object.keys(data).forEach((key_1) => {
            // special handler for rants
            if (key_1 === "rants") {
                cachedStream[key_1] = joinRants(cachedStream[key_1], data[key_1] as Array<CachedRant>)
            } else if (key_1 === "time") {
                // only update time if time doesn't already exist
                if (cachedStream[key_1] === "") {
                    cachedStream[key_1] = data[key_1] as string
                }
            } else {
                cachedStream[key_1] = data[key_1]
            }
        })
    }
    // save data back to storage
    saveStream(cachedStream).then()
}

/**
 * Remove the specified video from the saved data
 * @param videoId id of the video to remove
 * @returns A void promise
 */
export const removeStream = async (videoId: string): Promise<void> => {
    const streamKey = getStreamKey(videoId)
    return chrome.storage.local.remove(streamKey)
}

/**
 * Save the stream data
 * @param cacheData the stream data to save
 * @returns A void promise
 */
export const cacheStream = async (cacheData: CachedStream): Promise<void> => {
    return updateStream(cacheData.videoId, cacheData)
}

/**
 * Get all previously cached video ids
 * @returns list of video ids
 */
export const getAllVideoIs = async (): Promise<Array<string>> => {
    const streams = await getAllStreams()
    return streams.map((stream) => stream.videoId)
}

/**
 * Save the specified Rant to the stream data for the specified video
 * @param videoId id of the video to save Rant to
 * @param cachedRant the Rant data
 * @returns A void promise
 */
export const cacheMessage = async (videoId: string, cachedRant: CachedRant): Promise<void> => {
    return updateStream(videoId, { rants: [cachedRant] })
}

/**
 * Update a previously saved Rant in the video
 * @param videoId id of the video to update Rant in
 * @param messageId id of the Rant to update
 * @param data data to save. Key options are those in the {@link CachedRant}
 * @returns A void promise
 */
export const updateCachedMessage = async (
    videoId: string,
    messageId: string,
    data: {
        [key: string]: unknown
    },
): Promise<void> => {
    return updateStream(videoId, {
        rants: [
            {
                id: messageId,
                ...data,
            },
        ],
    })
}

/**
 * Get all previously saved Rants for the video
 * @param videoId id of the video to get Rants in
 * @returns list of previously saved Rants
 */
export const getAllCachedMessages = async (videoId: string): Promise<Array<CachedRant>> => {
    const cachedStream = await getStream(videoId)
    if (cachedStream === undefined) {
        return []
    }
    return cachedStream.rants
}

/**
 * Get the message ids for all Rants saved for the video
 * @param videoId id of the video to get Rants in
 * @returns list of Rant ids
 */
export const getAllCachedMessageIds = async (videoId: string): Promise<Array<string>> => {
    const rants = await getAllCachedMessages(videoId)
    return rants.map((rant) => rant.id)
}

/**
 * Get all saved user data
 * @returns list of user data
 */
export const getUsers = async (): Promise<Array<CacheUser>> => {
    const data = await chrome.storage.local.get({ users: [] })
    return data.users
}

/**
 * Get saved user data for the specified id
 * @param userId id of the user
 * @returns saved user data
 */
export const getUser = async (userId: string): Promise<CacheUser> => {
    const users = await getUsers()
    return users.find((user) => user.id === userId)
}

/**
 * Save users to storage
 * @param users list of user data
 * @returns A void promise
 */
const saveUsers = async (users: Array<CacheUser>): Promise<void> => {
    return chrome.storage.local.set({ users })
}

/**
 * Update one or more keys for the user
 * @param userId id of the user to update
 * @param data data to save. Key options are those in the {@link CacheUser}
 */
export const updateUser = async (
    userId: string,
    data: {
        [key: string]: unknown
    },
): Promise<void> => {
    const users = await getUsers()
    const matchingUser = users.find((user) => user.id === userId)
    if (matchingUser === undefined) {
        users.push(data as CacheUser)
    } else {
        Object.keys(matchingUser).forEach((key_1) => {
            matchingUser[key_1] = data[key_1]
        })
    }
    // save user data back
    saveUsers(users).then()
}

/**
 * Get badge definitions
 * @returns map of badge definitions where key is name nad value is the badge definition
 */
export const getBadges = async (): Promise<Map<string, CacheBadge>> => {
    const data = await chrome.storage.local.get({ badges: [] })
    const badgeMap: Map<string, CacheBadge> = new Map<string, CacheBadge>()
    data.badges.forEach((badge: CacheBadge) => {
        badgeMap.set(badge.name, badge)
    })
    return badgeMap
}

/**
 * Get saved badge data for the badge name specified
 * @param name the badge name
 * @returns saved badge data
 */
export const getBadge = async (name: string): Promise<CacheBadge> => {
    const badges = await getBadges()
    return badges.get(name)
}

/**
 *  Save badge definitions
 * @param badges badge definitions to save
 * @returns A void promise
 */
export const saveBadges = async (badges: Array<CacheBadge>): Promise<void> => {
    return chrome.storage.local.set({ badges })
}
