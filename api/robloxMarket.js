import * as rbx from './robloxAuth.js'

export async function getItems(list) {
    const link = "https://catalog.roblox.com/v1/catalog/items/details"

    let resp = await rbx.request(link, {
        method: "POST",
        body: JSON.stringify({
            "items": list
        })
    })

    return await resp.json()
}