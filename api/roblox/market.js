import { request } from './auth.js'
import { paginate } from '../../modules/utils.js'

export async function getBatchInfo(list) {
    const url = "https://catalog.roblox.com/v1/catalog/items/details"

    return await request(url, {
        method: "POST",
        body: JSON.stringify({ items: list })
    })
}

export async function getSalesHistory(id) {
    return await request(`https://economy.roblox.com/v1/assets/${id}/resale-data`)
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
    const response = await request(`https://economy.roblox.com/v1/assets/${id}/resellers?cursor=&limit=10`) 
    if (response.errors != undefined) return {
        error: "The reseller endpoint is ratelimited."
    }

    return response.data
}

export async function purchaseItem(productId, price, sellerId, userAssetId) {
    const body =  {
        expectedCurrency: 1,
        expectedPrice: price,
        expectedSellerId: sellerId,
        userAssetId: userAssetId
    }
    
    return await request(`https://economy.roblox.com/v1/purchases/products/${productId}`, {
        method: 'POST',
        body: JSON.stringify(body)
    })
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
        method: 'POST',
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
        method: 'POST',
        body: JSON.stringify(body)
    })
}