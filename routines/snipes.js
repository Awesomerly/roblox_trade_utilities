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
const minValue = config.snipes.minValue
const maxValue = config.snipes.maxValue

async function getSnipes() {
    const filteredPera = obj.PerathaxList
        // Filter out rap items if snipeRap is false
        .filter(elem => {
            return config.snipes.snipeRap || obj.ItemsList[elem.id].value
        })
        // Restrict to min/max values
        .filter(elem => obj.ItemsList[elem.id].defaultValue >= minValue &&
                        obj.ItemsList[elem.id].defaultValue <= maxValue)
        // Only take entries within peraRange
        .slice(...config.snipes.peraRange)
    
    // Get all the info from api for all the items in the filtered perathax
    const itemResp = await rbx.market.getBatchInfo(
        perathaxToBody(filteredPera)
    )
    
    if (itemResp.errors) {
        console.log("Too Many Snipe Requests. Taking a break")
        await sleep(10000)
        return
    }

    const promiseArray = []

    for (const item of itemResp.data) {
        const oldPrice = snipeCache[item.id]
        
        if (oldPrice != item.lowestPrice) {
            const value = obj.ItemsList[item.id].defaultValue
            const dealPercent = (1 - (item.lowestPrice / value)) * 100

            if (dealPercent >= minPercent &&
                dealPercent <= maxPercent) {
                dirtyWork(item)
            }

            if (item.lowestPrice != undefined) {
                snipeCache[item.id] = item.lowestPrice
            }

            // Console logging. don't freak out.
            if (cached && dealPercent > displayPercent) {
            	const priceChange = `\x1b[33m${oldPrice || "nothing"} => ${item.lowestPrice}`
                timeLog(`${item.name.trim()}:  ${priceChange}  \x1b[35m${value}  \x1b[31m${Math.round(dealPercent)}% \x1b[0m`)
            }
        }
    }

    if (!cached) cached = true
}

async function dirtyWork(item) {
    const itemInfo = obj.ItemsList[item.id]
    const isProjected = await checkIfProjected(item.id)
    if (isProjected) return
    
    let resellers = await rbx.market.getResellers(item.id)
    if (resellers.errors) return
    resellers = resellers.data

    const lowest = resellers[0]
    // if the expected price doesn't live up to the standards, then bail.
    if (item.lowestPrice != lowest.price) {
        timeLog(`Missed ${item.name} for ${item.lowestPrice}.`)
        return
    }

    const productId = obj.ProductIdList[item.id].productId

    const res = await rbx.market.purchaseItem(productId,
                                              item.lowestPrice, 
                                              lowest.seller.id, 
                                              lowest.userAssetId)
    if (res.purchased == true) {

        const webhookItem = {
            name: itemInfo.name,
            rap: itemInfo.rap,
            value: itemInfo.defaultValue,
            dealPercent: (1 - (item.lowestPrice / itemInfo.defaultValue)) * 100,
            assetId: item.id,
        }

        await sendPurchaseWebhook(webhookItem, lowest)

    } else {
        console.log(`UAID was ${lowest.userAssetId}`)
        console.log(`Seller was ${lowest.seller.name}`)    
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

    // if u error on THIS u might as well take the L..
    const resaleData = await rbx.market.getSalesHistory(assetId)
    if (resaleData.errors) {
        return true
    }

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
