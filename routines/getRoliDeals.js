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
    


async function purchaseItem(purchaseData, csrf) {

    const purchase = await fetch(purchaseData[1], {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrf
        },
        body: JSON.stringify(purchaseData[0])
    }).then(res => res.json())
    
    return purchase
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