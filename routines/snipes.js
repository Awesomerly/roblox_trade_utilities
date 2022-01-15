import fetch from 'node-fetch'
import * as rbx from "../api/roblox.js"
import obj from "../modules/objects.js"
import config from "../config.js"
import { sleep, timeLog } from "../modules/utils.js"
import { perathaxToBody } from "../modules/perathax.js"

let snipeCache = {}
let projCache = {}
let cached = false

const minPercent = config.snipes.minPercent 
const maxPercent = config.snipes.maxPercent
const displayPercent = config.snipes.displayPercent

async function getSnipes() {
    const filteredPera = obj.PerathaxList
        .filter(elem => {
            return config.snipes.snipeRap || obj.ItemsList[elem.id].value
        })
        .slice(...config.snipes.peraRange)
    
    
    const itemResp = await rbx.market.getBatchInfo(
        perathaxToBody(filteredPera)
    )
    
    if (itemResp.errors) {
        console.log(itemResp)
        console.log("Too Many Snipe Requests. Taking a break")
        await sleep(10000)
        return
    }

    const promiseArray = []

    for (const item of itemResp.data) {
        const oldPrice = snipeCache[item.id]
        if (oldPrice != item.lowestPrice) {
            if (obj.ItemsList[item.id] == undefined) {
                continue
            }
            const value = obj.ItemsList[item.id].defaultValue
            const dealPercent = (1 - (item.lowestPrice / value)) * 100

            const priceChange = `\x1b[33m${oldPrice || "nothing"} => ${item.lowestPrice}`
            if (cached && dealPercent > displayPercent) {
                timeLog(`${item.name.trim()}:  ${priceChange}  \x1b[35m${value}  \x1b[31m${Math.round(dealPercent)}% \x1b[0m`)
            }

            if (dealPercent >= minPercent &&
                dealPercent <= maxPercent) {
                    promiseArray.push(dirtyWork(item))
            }
        }

        if (item.lowestPrice) {
            snipeCache[item.id] = item.lowestPrice
        }
    }

    if (!cached) cached = true

    await Promise.all(promiseArray)
}

async function dirtyWork(item) {
    const itemInfo = obj.ItemsList[item.id]
    const projStatus = await checkIfProjected(item.id)
    console.log(itemInfo.name, projStatus)
    if (projStatus) return
    
    const resellers = await rbx.market.getResellers(item.id)
    const lowest = resellers[0]
    const productId = obj.ProductIdList[item.id].productId

    const res = await rbx.market.purchaseItem(productId, item.lowestPrice, lowest.seller.id, lowest.userAssetId)

    if (res.purchased == true) {

        const webhookItem = {
            name: itemInfo.name,
            rap: itemInfo.rap,
            value: itemInfo.defaultValue,
            dealPercent: (1 - (item.lowestPrice / itemInfo.defaultValue)) * 100,
            assetId: item.id,
        }

        await sendPurchaseWebhook(webhookItem, lowest)

    }
    console.log(res)
}

async function checkIfProjected(assetId) {
    if (obj.ItemsList[assetId].value) {
        return false
    }

    if (projCache[assetId] && projCache[assetId].status == true) {
        if (obj.ItemsList[assetId].rap / projCache[assetId].rap > 1.4) {
            return true
        } else {
            projCache[assetId].status = false
            delete projCache[assetId].rap
            return false
        }

    }

    const resaleData = await rbx.request(`https://economy.roblox.com/v1/assets/${assetId}/resale-data`)
        .then(resp => resp.json())

    const trueRap = resaleData.recentAveragePrice
    const pricePoints = resaleData.priceDataPoints
        .map(x=>x.value)
        .sort((a,b) => a-b)

    if (pricePoints.length > 2) {
        const highestSale = pricePoints.slice(-1)[0]
        const low = Math.round(pricePoints.length * 0.1);
        const high = pricePoints.length - low;
        const data2 = pricePoints.slice(low,high);

        const truncRap = Math.floor(
          (data2.reduce((a,b)=>a+b)/data2.length)+0.5)


        if (trueRap / truncRap > 1.4 || trueRap > 2*highestSale) {
            projCache[assetId] = {
                status: true,
                rap: truncRap
            }
            return true
        } else {
            projCache[assetId] = {
                status: false
            }
            return false
        }

    } else {
        return false
    }
}

/*
{
    item: {
        name
        rap
        value
        dealPercent
        assetId
    }
    listing: {
        "userAssetId":452981782,
        "seller": {
            "id":453246493,
            "type":"User",
            "name":"unknownrealities"
        },
        "price":92887,
        "serialNumber":null
    }
}
*/
async function sendPurchaseWebhook(item, listing) {  
    const webhookUrl = 'https://discordapp.com/api/webhooks/713541799712653334/uAVtxdSAnRnvFlUDoN2d7QAiwKRQQ0qJ_SgyYIMMP0cNuP3cV7NMUfZJWwMVxG5emFEy'
    const thumbUrl = `https://www.roblox.com/asset-thumbnail/image?assetId=${item.assetId}&width=720&height=720&format=png`
    const itemUrl = `https://www.roblox.com/catalog/${item.assetId}/unnamed`
    const profileUrl = `https://www.roblox.com/users/${listing.seller.id}/profile`

    const sellerName = `[${listing.seller.name}](${profileUrl})`
    const title = `${item.name.trim()} was bought for ${listing.price} ROBUX`

    const formData = {
        "content": null,
        "embeds": [
            {
                "title": title,
                "url": itemUrl,
                "color": 13184044,
                "fields": [
                    {
                        "name": "RAP",
                        "value": String(item.rap),
                        "inline": true
                    },
                    {
                        "name": "Percent",
                        "value": String(Math.round(item.dealPercent)) + '%',
                        "inline": true
                    },
                    {
                        "name": "Seller",
                        "value": sellerName
                    },
                    {
                        "name": "UAID",
                        "value": String(listing.userAssetId),
                        "inline": true
                    }
                ],
                "thumbnail": {
                    "url": thumbUrl
                }
            }
        ]
    }
    
    if (item.value != item.rap) {
        formData.embeds[0].fields.splice(1, 0, {
            "name": "Value",
            "value": String(item.value),
            "inline": true
        })
    }
    

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
}

export default getSnipes