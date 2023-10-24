/**
 * Custom wrapper around console.log that disables logging in production
 *
 * See {@link console.log} for further details
 * @param message the primary data to log
 * @param optionalParams additional data to log
 */
export const consoleLog = (message?: unknown, ...optionalParams: unknown[]): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (DEBUG) {
        // eslint-disable-next-line no-console
        console.log(message, ...optionalParams)
    }
}

/**
 * Custom wrapper around console.error that disables logging in production
 *
 * See {@link console.error} for further details
 * @param message the primary data to log
 * @param optionalParams additional data to log
 */
export const consoleError = (message?: unknown, ...optionalParams: unknown[]): void => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (DEBUG) {
        console.error(message, ...optionalParams)
    }
}
