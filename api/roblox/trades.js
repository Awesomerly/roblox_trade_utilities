import { paginate } from "../../modules/utils.js"
import { request } from './auth.js'

export async function getInbound() {
    const url = "https://trades.roblox.com/v1/trades/inbound?limit=100&sortOrder=Desc"
    const trades = await paginate(url)
    
    return trades
}

export async function getTradeInfo(tradeId) {
    const url = `https://trades.roblox.com/v1/trades/${tradeId}`
    return await request(url)
        .then(res => res.json())
}

export async function declineTrade(tradeId) {
    const url = `https://trades.roblox.com/v1/trades/${tradeId}/decline`
    return await request(url, { method: 'POST' })
}

export async function acceptTrade(tradeId) {
    const url = `https://trades.roblox.com/v1/trades/${tradeId}/accept`
    return await request(url, { method: 'POST' })
}