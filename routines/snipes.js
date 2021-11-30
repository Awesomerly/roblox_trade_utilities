import * as rbx from "../api/roblox.js"
import obj from "../modules/objects.js"
import { sleep, timeLog } from "../modules/utils.js"
import { perathaxToBody } from "../modules/perathax.js"
// TEMPORARY
import productIdList from "../modules/productIds.js"

let snipeCache = {}
let projCache = {}
let cached = false
const minPercent = 38 
const maxPercent = 70
const displayPercent = 0

async function getSnipes() {
    const filteredPera = obj.PerathaxList
//        .filter(elem => obj.ItemsList[elem.id].value)
        .slice(0, 100)

    const itemResp = await rbx.market.getBatchInfo(
        perathaxToBody(filteredPera)
    )
    
    if (itemResp.errors) {
        console.log(itemResp)
        console.log("Too Many Snipe Requests. Taking a break")
        await sleep(10000)
        return
    }

    const date = new Date()
    const curTime = date.toLocaleTimeString('it-IT')

    const promiseArray = []

    for (const item of itemResp.data) {
        const oldPrice = snipeCache[item.id]
        if (oldPrice != item.lowestPrice) {
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
    const projStatus = await checkIfProjected(item.id)
    console.log(obj.ItemsList[item.id].name, projStatus)
    if (projStatus) return
    
    const resellers = await rbx.market.getResellers(item.id)
    const lowest = resellers[0]
    const productId = productIdList[item.id].productID

    const res = await rbx.market.purchaseItem(productId, item.lowestPrice, lowest.seller.id, lowest.userAssetId)
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

export default getSnipes

/*
//the fuck is it Handle Message, I Want To Have More Messages????
async function handleDealsMessage(request) {

    // request format: (needs name field (sike no it doesn't billa bots the entire thing))
    // {
    //     'assetId': assetId,
    //     'expectedPrice': expectedPrice,
    //     'isValued': isValued
    // }

    const assetId = request.assetId
    const isValued = request.isValued
    const product = Catalog.productIdList[`${assetId}`]
    const productId = product['productID']

    const isProjected = await checkIfProjected(assetId, isValued)
    // console.log(`AssetId: ${request.assetId}`)
    // console.log(`Projected: ${isProjected}`)
    // console.log(`Valued: ${isValued}`)

    if (isProjected == false || isValued) {

        const sellerPromise = fetch(`https://economy.roblox.com/v1/assets/${assetId}/resellers?cursor=&limit=10`)
            .then(res => res.json())
            .then(json => {
                const lowestSeller = json.data[0]
                const expectedPrice = request.expectedPrice
                const userAssetId = lowestSeller.userAssetId
                const sellerId = lowestSeller.seller.id

                const buyUrl = 'https://economy.roblox.com/v1/purchases/products/' + productId

                const infoTable = {
                    expectedCurrency: 1,
                    expectedPrice: expectedPrice,
                    expectedSellerId: sellerId,
                    userAssetId: userAssetId
                }
                return [infoTable, buyUrl]
            })

        const [lowSellerData, csrfToken] = await Promise.all([sellerPromise, CurrentPlayer.getCsrf()])

        const purchase = await purchaseItem(lowSellerData, csrfToken)

        //make the below a little bit more complete.

        if (purchase.purchased == true) {
            console.log('purchased')
            chrome.notifications.create('roliextension-deals', {
                'type': 'basic',
                'title': `You bought ${purchase.assetName}`,
                'message': `R\$${lowSellerData[0].expectedPrice}`
            })
            sendPurchaseWebhook({
                price: lowSellerData[0].expectedPrice,
                sellerName: purchase.sellerName,
                assetName: purchase.assetName,
                assetId: purchase.assetId,
            })
        } else {
            console.log('Purchase Error')
            chrome.notifications.create('roliextension-deals', {
                'type': 'basic',
                'title': 'Didn\'t get it.',
                'message': 'welp'
            })
        }


        return purchase

    } else {
        console.log('Not Purchased')
        chrome.notifications.create('roliextension-deals', {
            'type': 'basic',
            'title': 'bad item',
            'message': 'welp'
        })
    }
}

async function checkIfProjected(assetId, override) {

    if (override){
        return false
    }

    const resaleData = await fetch(`https://economy.roblox.com/v1/assets/${assetId}/resale-data`)
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
            return true
        } else {
            return false
        }

    } else {
        return false
    }
}

//Add some more data points to this right here webhook
//price, sellerName, assetName, assetId
async function sendPurchaseWebhook(purchaseData) {
    const date = new Date()
    const timestamp = date.toISOString()
    const webhookUrl = 'https://discordapp.com/api/webhooks/713541799712653334/uAVtxdSAnRnvFlUDoN2d7QAiwKRQQ0qJ_SgyYIMMP0cNuP3cV7NMUfZJWwMVxG5emFEy'
    const formData = {
      "embeds": [
        {
          "title": `${purchaseData.assetName}`,
          "description": `Bought for R\$${purchaseData.price}\nSeller: ${purchaseData.sellerName}`,
          "url": `https://www.roblox.com/catalog/${purchaseData.assetId}/unnamed`,
          "color": 7506394,
          "timestamp": timestamp,
          "thumbnail": {
            "url": `https://www.roblox.com/asset-thumbnail/image?assetId=${purchaseData.assetId}&width=420&height=420&format=png`
          }
        }
      ]
    }

    fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
}


chrome.runtime.onMessage.addListener(handleDealsMessage)
*/
