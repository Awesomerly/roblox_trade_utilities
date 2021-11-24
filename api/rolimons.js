import fetch from "node-fetch"
import jwt_decode from "jwt-decode"
import { JSDOM } from "jsdom"

let isBanned = false

export const demand = Object.freeze({
	TERRIBLE: 0,
	LOW: 1,
	NORMAL: 2,
	HIGH: 3,
	AMAZING: 4
})

export const trend = Object.freeze({
	LOWERING: 0,
	UNSTABLE: 1,
	STABLE: 2,
	RAISING: 3,
	FLUCTUATING: 4
})

// TODO throw error msgs that mean something outside of this bot :)
function handleErrors(response) {
    if (response.status == 403) {
        setBan()
        throw new Error("Banned.")
    }
    if (!response.ok)
        throw Error(response.statusText)
    return response
}

function setBan() {
    if (isBanned === false) {
        isBanned = true
        setTimeout(() => { isBanned = false }, 60000)
    }
}

export async function getSales() {
    if (isBanned)
        throw new Error("Banned.")
    let resp = await fetch('https://www.rolimons.com/api/activity')
        .then(handleErrors)
        .then(res => res.json())
        .then(json => json.activities)

    // TODO figure out what happens when a new item gets released.
    resp = resp.sort((a, b) => b[0] - a[0])

    let sold = resp
        .filter(act => act[1] == 1)
        .map(x => ({
            'timestamp': x[0],
            'assetId': x[2],
            'oldRap': x[3],
            'newRap': x[4]
        }))

    return sold
}

export async function getItems() {
    if (isBanned)
        throw new Error("Banned.")
    let resp = await fetch("https://www.rolimons.com/itemapi/itemdetails")
        .then(handleErrors)
        .then(res => res.json())

    let formattedInfo = Object.fromEntries(Object.entries(resp.items).map(([assetId, assetArr]) => {
        let assetInfo = {
            "name": assetArr[0],
            "rap": assetArr[2],
            "defaultValue": assetArr[4]
        }

        if (assetArr[1].length > 0)
            assetInfo.acronym = assetArr[1]
        if (assetArr[3] >= 0)
            assetInfo.value = assetArr[3]
        if (assetArr[5] >= 0)
            assetInfo.demand = assetArr[5]
        if (assetArr[6] >= 0)
            assetInfo.trend = assetArr[6]
        if (assetArr[9] == 1)
            assetInfo.rare = true


        return [assetId, assetInfo]
    }))

    return formattedInfo

}

/*
 * TABLE FORMAT
 * 0: name
 * 1: asset type 
 * 2: orig price
 * 3+4: creation + limited date
 * 5: best price
 * 6: favs
 * 7: sellers
 * 8: rap
 * 9: owners
 * 10: prem owners
 * 11: total copies
 * 12: deleted copies
 * 13: prem copies
 * 14: hoarded copies
 * 15: acronym
 * 16: value
 * 
 * 22: default value 
 */

// TODO: add labels to this
export async function getTable() {
    if (isBanned)
        throw new Error("Banned.")

    const pagetxt = await fetch("https://www.rolimons.com/itemtable")
        .then(handleErrors)
        .then(res => res.text())

    // using jsdom to parse the text
    const dom = new JSDOM(pagetxt)
    const doc = dom.window.document.body

    // get all script text
    const scripts = [...doc.querySelectorAll("script")]
        .map(x => x.textContent)

    // find script with right variable declaration in it
    const tableScr = scripts.filter((str) => str.includes("item_details"))[0]
    // slice from the first curly bracket to before the ending semicolon
    const obj = tableScr.slice(tableScr.indexOf("{"), -1)

    return JSON.parse(obj)
}

// TODO: If the token expires at a reasonable time, when there's an error, regenerate a token
// TODO: Throw errors if stuff goes wrong
export async function sendAd(offerIds, requestIds = [], tags = []) {
    // extracting player id from the cookie itself...
    let playerId = jwt_decode(process.env.ROLIVERIFICATION).player_data.id
    console.log(playerId)
    let reqBody = {
        player_id: playerId,
        offer_item_ids: offerIds,
        request_item_ids: requestIds,
        request_tags: tags
    }

    console.log(JSON.stringify(reqBody))

    let resp = await fetch("https://www.rolimons.com/tradeapi/create", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            cookie: `_RoliVerification=${process.env.ROLIVERIFICATION}`
        },
        body: JSON.stringify(reqBody),
    }).then(res => res.json())

    return resp
}