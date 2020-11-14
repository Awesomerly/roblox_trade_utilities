let fetch = require("node-fetch")

let isBanned = false

let handleErrors = (response) => {
    if (response.status == 403) {
        setBan()
        throw new Error("Banned.")
    }
    if (!response.ok) throw Error(response.statusText)
    return response
}

let setBan = () => {
    if (isBanned === false) {
        isBanned = true
        setTimeout(() => {isBanned = false}, 5000)
    }
}

let activity = async () => {
    if (isBanned) throw new Error("Banned.")
    let resp = await fetch('https://www.rolimons.com/api/activity')
        .then(handleErrors)
        .then(res => res.json())
        .then(json => json.activities)

    // TODO figure out what happens when a new item gets released.
    resp = resp.sort((a, b) => b[0] - a[0])

    let onsale = resp
        .filter(act => act[1] == 0)
        .map(x => ({
            'timestamp': x[0], 
            'assetId': parseInt(x[2]),
            'price': x[3],
            'rap': x[4]
        }))
    
    let sold = resp
        .filter(act => act[1] == 1)
        .map(x => ({
            'timestamp': x[0], 
            'assetId': parseInt(x[2]),
            'oldRap': x[3],
            'newRap': x[4]
        }))

    return {onsale, sold}
}

// TODO: play around with formatting of the response to this endpoint
let items = async () => {
    if (isBanned) throw new Error("Banned.")
    let resp = await fetch("https://www.rolimons.com/itemapi/itemdetails")
        .then(handleErrors)
        .then(res => res.json)

    let formattedInfo = Object.fromEntries(Object.entries(resp.items).map(([assetId, assetArr]) => {
        let assetInfo = {
            "name": assetArr[0],
            "rap": assetArr[2]
        }

        if (assetArr[1].length > 0) assetInfo.acronym = assetArr[1]
        if (assetArr[3] >= 0)       assetInfo.value = assetArr[3] 
        if (assetArr[5] >= 0)       assetInfo.demand = assetArr[5]
        if (assetArr[6] >= 0)       assetInfo.trend = assetArr[6]
        if (assetArr[9] == 1)       assetInfo.rare = true


        return [assetId, assetInfo]
    }))

    return formattedInfo
    
}

// TODO: implement ad send function
let sendAd = async () => {
//     await fetch("https://www.rolimons.com/tradeapi/create", {
//     "credentials": "include",
//     "headers": {
//         "User-Agent": "Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:81.0) Gecko/20100101 Firefox/81.0",
//         "Accept": "application/json, text/javascript, */*; q=0.01",
//         "Accept-Language": "en-US,en;q=0.5",
//         "Content-Type": "application/json",
//         "X-Requested-With": "XMLHttpRequest"
//     },
//     "referrer": "https://www.rolimons.com/tradeadcreate",
//     "body": "{\"player_id\":1509841678,\"offer_item_ids\":[1743932756,162066057,19027209],\"request_item_ids\":[],\"request_tags\":[\"any\"]}",
//     "method": "POST",
//     "mode": "cors"
//     });
    return
}

module.exports = {
    activity,
    items,
    setBan,
    get isBanned() {
        return isBanned
    }
}