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

export async function getSalesHistory(id) {
    return await request(`https://economy.roblox.com/v1/assets/${id}/resale-data`)
        .then(resp => resp.json())
}

/*
{
    "userAssetId":452981782,
    "seller": {
        "id":453246493,
        "type":"User",
        "name":"unknownrealities"
    },
    "price":92887,
    "serialNumber":null
}
*/
export async function getResellers(id) {
    let resp = await request(`https://economy.roblox.com/v1/assets/${id}/resellers?cursor=&limit=10`)
        .then(resp => resp.json())    
    
    return resp.data
}

export async function purchaseItem(productId, price, sellerId, userAssetId) {

    const purchase = await request(`https://economy.roblox.com/v1/purchases/products/${productId}`, {
        method: 'POST',
        json: {
            expectedCurrency: 1,
            expectedPrice: price,
            expectedSellerId: sellerId,
            userAssetId: userAssetId
        }
    }).then(res => res.json())
    
    return purchase
}
/*
{
    "userAssetId":28605,
    "serialNumber":null,
    "assetId":1028606,
    "name":"Red Baseball Cap",
    "recentAveragePrice":1768,
    "originalPrice":null,
    "assetStock":null,
    "buildersClubMembershipType":0
}
*/
export async function getPlayerInventory(id) {
    return await paginate(
        `https://inventory.roblox.com/v1/users/${id}/assets/collectibles?sortOrder=Asc&limit=100`
    )
}

export async function sellItem(assetId, uaid, price) {
    const url = "https://www.roblox.com/asset/toggle-sale"
    const body = {
        assetId: assetId,
        userAssetId: uaid,
        price: price,
        sell: true
    }

    return await request(url, {
        method: "POST",
        body: JSON.stringify(body)
    })
}

export async function unsellItem(assetId, uaid) {
    const url = "https://www.roblox.com/asset/toggle-sale"
    const body = {
        assetId: assetId,
        userAssetId: uaid,
        price: 0,
        sell: false
    }

    return await request(url, {
        method: "POST",
        body: JSON.stringify(body)
    })
}