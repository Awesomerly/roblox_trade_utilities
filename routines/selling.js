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
    myInv = myInv.filter(item => item.recentAveragePrice < 2000)

    for (const item of myInv) {
        let prodId = productIdList[item.assetId]
        if (prodId == undefined) {
            timeLog("ASSET ID ERROR")
            continue
        }
        prodId = prodId.productID

        const resellers = await rbx.market.getResellers(item.assetId)
        const topResale = resellers[0]

        const defaultItemVal = obj.ItemsList[item.assetId].defaultValue

        if (topResale.seller.id != obj.MyInfo.id &&
            topResale.price > (0.9 * defaultItemVal)) {
                timeLog(`Wanna Sell ${item.name} for ${topResale.price - 1}`)            
        }
        await sleep(2000)
    }
}

export default selling