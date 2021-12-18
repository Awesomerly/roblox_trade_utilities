import { timeLog, sleep } from '../modules/utils.js'
import obj from '../modules/objects.js'
import * as rbx from '../api/roblox.js'
import productIdList from "../modules/productIds.js"

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
async function selling() {
    let myInv = await rbx.market.getPlayerInventory(obj.MyInfo.id)
    myInv = myInv
        .filter(item => item.recentAveragePrice < 3000)

    for (const item of myInv) {
        // TODO: get updated product id list from cosmo
        let prodId = productIdList[item.assetId]
        if (prodId == undefined) {
            //timeLog("ASSET ID ERROR")
            continue
        }
        prodId = prodId.productID
        
        await sleep(2000)
        const resellers = await rbx.market.getResellers(item.assetId)
        const topResale = resellers[0]
        let desiredPrice = topResale.price - 1
        
        const defaultItemVal = obj.ItemsList[item.assetId].defaultValue

        // when you are the top seller, you wanna check the second best 
        if (topResale.seller.id == obj.MyInfo.id) {
            // if it is barely above ur current price nothing else needs to be done
            if (topResale.price - resellers[1].price <= 1) continue

            let desiredPrice = resellers[1].price - 1
        } else {
            const rap = item.recentAveragePrice
            // if the best price is low or troll, don't try to pricewar it
            if (topResale.price < (rap * 0.95) ||
                topResale.price > (rap * 5)) {
                    continue
            }

            let desiredPrice = resellers[0].price - 1
        }

        timeLog(`Selling ${item.name} for ${desiredPrice}, rap ${defaultItemVal}`)
        const resp = await rbx.market.sellItem(item.assetId, item.userAssetId, desiredPrice)

        console.log(await resp)
    }
}

export default selling