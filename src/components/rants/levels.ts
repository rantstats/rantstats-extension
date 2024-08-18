import { CONSTS } from "../../types/consts"
import { RumbleRantLevel } from "../../types/rumble-types"

import { setRantLevelValues } from "./rant"

const fallbackLevels: Array<RumbleRantLevel> = [
    {
        price_dollars: 1,
        duration: 120,
        colors: { fg: "white", main: "#4a90e2", bg2: "#4382cb" },
        ids: ["rant1", "rant1qa", "rant1dev"],
    },
    {
        price_dollars: 2,
        duration: 180,
        colors: { fg: "black", main: "#b8e986", bg2: "#a6d279" },
        ids: ["rant2", "rant2qa", "rant2dev"],
    },
    {
        price_dollars: 5,
        duration: 300,
        colors: { fg: "black", main: "#f8e71c", bg2: "#dfd019" },
        ids: ["rant5", "rant5qa", "rant5dev"],
    },
    {
        price_dollars: 10,
        duration: 600,
        colors: { fg: "black", main: "#f5a623", bg2: "#dd9520" },
        ids: ["rant10", "rant10qa", "rant10dev"],
    },
    {
        price_dollars: 20,
        duration: 1200,
        colors: { fg: "white", main: "#bd10e0", bg2: "#aa0eca" },
        ids: ["rant20", "rant20qa", "rant20dev"],
    },
    {
        price_dollars: 50,
        duration: 2400,
        colors: { fg: "white", main: "#9013fe", bg2: "#8211e5" },
        ids: ["rant50", "rant50qa", "rant50dev"],
    },
    {
        price_dollars: 100,
        duration: 3600,
        colors: { fg: "white", main: "#d0021b", bg2: "#bb0218" },
        ids: ["rant100", "rant100qa", "rant100dev"],
    },
    {
        price_dollars: 200,
        duration: 7200,
        colors: { fg: "white", main: "#d0021b", bg2: "#bb0218" },
        ids: ["rant200", "rant200qa", "rant200dev"],
    },
    {
        price_dollars: 300,
        duration: 10800,
        colors: { fg: "white", main: "#d0021b", bg2: "#bb0218" },
        ids: ["rant300", "rant300qa", "rant300dev"],
    },
    {
        price_dollars: 400,
        duration: 14400,
        colors: { fg: "white", main: "#d0021b", bg2: "#bb0218" },
        ids: ["rant400", "rant400qa", "rant400dev"],
    },
    {
        price_dollars: 500,
        duration: 18000,
        colors: { fg: "white", main: "#d0021b", bg2: "#bb0218" },
        ids: ["rant500", "rant500qa", "rant500dev"],
    },
]

/**
 * Generate CSS style data for Rumble Rants based on the level data received
 * @param levelInfo The received Rant level data
 * @returns The CSS style lines
 */
const generateStyleLines = (levelInfo: RumbleRantLevel): Array<string> => {
    const externalChat = `.external-chat[data-level="${levelInfo.price_dollars}"]`
    return [
        `${externalChat} { background: ${levelInfo.colors.bg2} !important; }`,
        `${externalChat} * { color: ${levelInfo.colors.fg} !important; }`,
        `${externalChat} .rant-amount { background: ${levelInfo.colors.main} !important; }`,
    ]
}

/**
 * Parse level data from received message
 * @param levels received level data
 * @param fallback true: fallback to hardcoded levels and formatting rather than using received data
 */
export const parseLevels = (levels: Array<RumbleRantLevel>, fallback: boolean = false): void => {
    if (document.getElementById(CONSTS.LEVEL_STYLE_ID)) {
        return
    }

    const styleLines: Array<string> = []

    let levelList: Array<RumbleRantLevel>
    if (fallback || levels.length === 0) {
        levelList = fallbackLevels
    } else {
        levelList = levels
    }

    const rantLevelValues: Array<number> = []
    levelList.forEach((rantLevel) => {
        rantLevelValues.push(rantLevel.price_dollars)
        styleLines.push(...generateStyleLines(rantLevel))
    })

    rantLevelValues.sort()
    setRantLevelValues(rantLevelValues)

    const levelStyle = document.createElement("style") as HTMLStyleElement
    levelStyle.id = CONSTS.LEVEL_STYLE_ID
    levelStyle.appendChild(document.createTextNode(styleLines.join(" ")))
    document.head.appendChild(levelStyle)
}
