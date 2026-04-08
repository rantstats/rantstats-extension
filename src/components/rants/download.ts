import { getStream } from "../../cache"
import { getVideoIdFromDiv } from "../../utils"

/**
 * Handle saving cached data for stream to a CSV file
 * @param event click event
 */
export const downloadCSV = (event: Event): void => {
    const videoId = getVideoIdFromDiv()
    if (videoId === null) {
        return
    }
    getStream(videoId).then((streamData) => {
        const rows = [
            ["Stream", JSON.stringify(streamData.title)],
            ["URL", JSON.stringify(streamData.url)],
            ["Video ID", JSON.stringify(streamData.videoId)],
            ["Creator", JSON.stringify(streamData.creator), JSON.stringify(streamData.creatorUrl)],
            ["Date", JSON.stringify(streamData.time)],
            [],
            ["Id", "Time", "User", "Username", "Text", "Rant Amount", "Read"],
        ]

        streamData.rants.forEach((data) => {
            let rantAmount = ""
            if (data.rant && data.rant?.price_cents !== undefined) {
                rantAmount = (data.rant.price_cents / 100).toString()
            }
            rows.push([
                JSON.stringify(data.id),
                JSON.stringify(data.time),
                JSON.stringify(data.user_id),
                JSON.stringify(data.username),
                JSON.stringify(data.text),
                JSON.stringify(rantAmount),
                JSON.stringify(data.read),
            ])
        })

        const encodedData = encodeURIComponent(rows.map((row) => row.join(",")).join("\n"))
        const csvData = `data:text/csv;charset=utf-8,${encodedData}`
        const link = document.createElement("a") as HTMLAnchorElement
        link.href = csvData
        link.download = "rant_stats.csv"
        link.click()
    })

    event.preventDefault()
}
