import { Messages } from "../../types/messages"
import { Theme } from "../../types/option-types"

import { sendAction } from "./send-action"

/**
 * Send Message with updated Theme
 * @param theme updated theme value
 */
export const rumbleThemeChanged = (theme: Theme): void => {
    sendAction(Messages.RUMBLE_THEME_CHANGED, { theme })
}
