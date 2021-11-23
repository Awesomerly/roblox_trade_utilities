import * as rbx from './robloxAuth.js'
import { paginate } from '../modules/utils.js'

export async function getBatchLimiteds(list) {
    const link = "https://catalog.roblox.com/v1/catalog/items/details"

    let resp = await rbx.request(link, {
        method: "POST",
        body: JSON.stringify({
            "items": list
        })
    })

    return await resp.json()
}

export async function getPlayerInventory(id) {
    return await paginate(
        `https://inventory.roblox.com/v1/users/${id}/assets/collectibles?sortOrder=Asc&limit=100`
    )
}