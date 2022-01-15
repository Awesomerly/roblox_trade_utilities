import { paginate } from "../../modules/utils.js"
import { request } from './auth.js'

export async function getInbound() {
    const url = "https://trades.roblox.com/v1/trades/inbound?limit=100&sortOrder=Desc"
    return await paginate(url)
}

export async function getTradeInfo(tradeId) {
    const url = `https://trades.roblox.com/v1/trades/${tradeId}`
    return await request(url)
}

export async function declineTrade(tradeId) {
    const url = `https://trades.roblox.com/v1/trades/${tradeId}/decline`
    return await request(url, { method: 'POST' })
}

export async function acceptTrade(tradeId) {
    const url = `https://trades.roblox.com/v1/trades/${tradeId}/accept`
    return await request(url, { method: 'POST' })
}