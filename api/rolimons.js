let fetch = require("node-fetch")
let jwt_decode = require("jwt-decode")

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
        .then(res => res.json())

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

// TODO: If the token expires at a reasonable time, when there's an error, regenerate a token
// TODO: Throw errors if stuff goes wrong
let sendAd = async (offerIds, requestIds = [], tags = []) => {
    //const tags = ["any", "demand", "rares", "robux", "upgrade", "downgrade"]
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
    }).then(res => res.json());

    return resp
}

module.exports = {
    activity,
    items,
    setBan,
    sendAd,
    get isBanned() {
        return isBanned
    }
}