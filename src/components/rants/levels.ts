import { CONSTS } from "../../types/consts"
import { RumbleRantLevel } from "../../types/rumble-types"

import { setRantLevelValues } from "./rant"

/**
 * Parse level data from received message
 * @param levels received level data
 * @param fallback true: fallback to hardcoded levels and formatting rather than using received data
 */
export const parseLevels = (levels: Array<RumbleRantLevel>, fallback: boolean = false): void => {
    if (document.getElementById(CONSTS.LEVEL_STYLE_ID)) {
        return
    }

    const styleLines = []

    if (fallback || levels.length === 0) {
        setRantLevelValues([1, 2, 5, 10, 20, 50, 100, 200, 300, 400, 500])
        styleLines.push(
            ...[
                '.external-chat[data-level="1"] { background: #4382CB !important; }',
                '.external-chat[data-level="1"] * {color: white !important; }',
                '.external-chat[data-level="1"] .rant-amount { background: #4A90E2 !important; }',
                '.external-chat[data-level="2"] { background: #A6D279 !important; }',
                '.external-chat[data-level="2"] * {color: black !important; }',
                '.external-chat[data-level="2"] .rant-amount { background: #B8E986 !important; }',
                '.external-chat[data-level="5"] { background: #DFD019 !important; }',
                '.external-chat[data-level="5"] * {color: black !important; }',
                '.external-chat[data-level="5"] .rant-amount { background: #F8E71C !important; }',
                '.external-chat[data-level="10"] { background: #DD9520 !important; }',
                '.external-chat[data-level="10"] * {color: black !important; }',
                '.external-chat[data-level="10"] .rant-amount { background: #F5A623 !important; }',
                '.external-chat[data-level="20"] { background: #AA0ECA !important; }',
                '.external-chat[data-level="20"] * {color: white !important; }',
                '.external-chat[data-level="20"] .rant-amount { background: #BD10E0 !important; }',
                '.external-chat[data-level="50"] { background: #8211E5 !important; }',
                '.external-chat[data-level="50"] * {color: white !important; }',
                '.external-chat[data-level="50"] .rant-amount { background: #9013FE !important; }',
                '.external-chat[data-level="100"] { background: #BB0218 !important; }',
                '.external-chat[data-level="100"] * {color: white !important; }',
                '.external-chat[data-level="100"] .rant-amount { background: #D0021B !important; }',
                '.external-chat[data-level="200"] { background: #BB0218 !important; }',
                '.external-chat[data-level="200"] * {color: white !important; }',
                '.external-chat[data-level="200"] .rant-amount { background: #D0021B !important; }',
                '.external-chat[data-level="300"] { background: #BB0218 !important; }',
                '.external-chat[data-level="300"] * {color: white !important; }',
                '.external-chat[data-level="300"] .rant-amount { background: #D0021B !important; }',
                '.external-chat[data-level="400"] { background: #BB0218 !important; }',
                '.external-chat[data-level="400"] * {color: white !important; }',
                '.external-chat[data-level="400"] .rant-amount { background: #D0021B !important; }',
                '.external-chat[data-level="500"] { background: #BB0218 !important; }',
                '.external-chat[data-level="500"] * {color: white !important; }',
                '.external-chat[data-level="500"] .rant-amount { background: #D0021B !important; }',
            ],
        )
    } else {
        const rantLevelValues = []
        levels.forEach((rantLevel: RumbleRantLevel) => {
            rantLevelValues.push(rantLevel.price_dollars)
            const externalChat = `.external-chat[data-level="${rantLevel.price_dollars}"]`
            styleLines.push(
                ...[
                    `${externalChat} {`,
                    `background: ${rantLevel.colors.bg2} !important;`,
                    `}`,
                    `${externalChat} * {`,
                    `color: ${rantLevel.colors.fg} !important;`,
                    `}`,
                    `${externalChat} .rant-amount {`,
                    `background: ${rantLevel.colors.main} !important;`,
                    `}`,
                ],
            )
        })

        rantLevelValues.sort()
        setRantLevelValues(rantLevelValues)
    }

    const levelStyle = document.createElement("style") as HTMLStyleElement
    levelStyle.id = CONSTS.LEVEL_STYLE_ID
    levelStyle.appendChild(document.createTextNode(styleLines.join(" ")))
    document.head.appendChild(levelStyle)
}
