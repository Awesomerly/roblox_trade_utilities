import { request } from './auth.js'
import { paginate } from '../../modules/utils.js'

export async function getBatchInfo(list) {
    const link = "https://catalog.roblox.com/v1/catalog/items/details"

    let resp = await request(link, {
        method: "POST",
        json: { items: list }
    })

    return await resp.json()
}

export async function getResellers(id) {
    return await rbx.request(`https://economy.roblox.com/v1/assets/${id}/resale-data`)
        .then(resp => resp.json())
}

export async function getPlayerInventory(id) {
    return await paginate(
        `https://inventory.roblox.com/v1/users/${id}/assets/collectibles?sortOrder=Asc&limit=100`
    )
}