import { timeLog, sleep } from '../modules/utils.js'
import obj from '../modules/objects.js'
import config from '../config.js'
import * as rbx from '../api/roblox.js'

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

const sellCfg = config.selling
const itemKeeps = config.items.keep

async function selling() {
    let myInv = await rbx.market.getPlayerInventory(obj.MyInfo.id)
    if (myInv.errors) return
    
    myInv = myInv
//        .filter(item => item.recentAveragePrice < 3000)
            .filter(item => !(obj.ItemsList[item.assetId].value)) // Filter out valueds
            .filter(item => !(itemKeeps.serials.includes(item.serialNumber)))
            .filter(item => !(itemKeeps.assetIds.includes(item.assetId)))
            .filter(item => !(itemKeeps.uaids.includes(item.userAssetId)))

    for (const item of myInv) {
        // TODO: get updated product id list from cosmo
        let prodId = obj.ProductIdList[item.assetId]
        if (prodId == undefined) {
            timeLog(`The assetId ${item.assetId} isn't on Cosmo's list.`)
            continue
        }
        prodId = prodId.productID
        
        await sleep(2000)

        let resellers = await rbx.market.getResellers(item.assetId)
        if (resellers.errors) {
            console.warn(resellers.errors[0].message)
            timeLog("Ratelimited on api endpoint, chilling out")
            await sleep(10000)
            continue
        }

        resellers = resellers.data

        const topResale = resellers[0]
        let desiredPrice = topResale.price - 1
        
        const defaultItemVal = obj.ItemsList[item.assetId].defaultValue

        // when you are the top seller, you wanna check the second best 
        if (topResale.seller.id == obj.MyInfo.id) {
            // if it is barely above ur current price nothing else needs to be done
            if (resellers[1].price - topResale.price <= 1) continue
            desiredPrice = resellers[1].price - 1
        } else {
            // if the best price is low or troll, don't try to pricewar it
            if (topResale.price < (defaultItemVal * sellCfg.threshold.min) ||
                topResale.price > (defaultItemVal * sellCfg.threshold.max)) {
                    continue
            }
        }

        if (sellCfg.usellItem) {
            // try to unlist item first
            await rbx.market.unsellItem(item.assetId, item.userAssetId)
            await sleep(1000)
        }
        const resp = await rbx.market.sellItem(item.assetId, item.userAssetId, desiredPrice)

        if (resp.isValid == true) {
            if (resp.data.isTwoStepVerificationRequired) {
                timeLog("2FA is needed to sell items.")
                return
            }
            timeLog(`Selling ${item.name.trim()} for ${desiredPrice}, rap ${defaultItemVal}`)
        } else if (resp.errors) {
            timeLog(`${item.name.trim()} sale failed.`)
        }
    }
}

export default selling