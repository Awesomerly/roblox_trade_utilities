import fetch from "node-fetch"
import { sleep, timeLog } from "../modules/utils.js"
import * as rbx from "../api/roblox.js"

async function getBotList() {
    const botUrl = "https://gist.githubusercontent.com/codetariat/03043d47689a6ee645366d327b11944c/raw/"
    return await fetch(botUrl)
}

async function declineBots() {
    let declinedCount = 0

    const botList = await getBotList().then(resp => resp.json())
    const tradesList = await rbx.trades.getInbound()

    for (const trade of tradesList) {
        // Is Botted
        if (botList.filter(entry => entry[0] == trade.user.id).length > 0) {
            await sleep(200)
            await rbx.trades.declineTrade(trade.id)
            declinedCount += 1
            continue
        }
    }
    if (declinedCount > 0) {
        timeLog(`${declinedCount} trades declined.`)
    }
}

export default declineBots
