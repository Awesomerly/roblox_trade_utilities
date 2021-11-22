/*let roli = require("./api/rolimons")
let { setIntervalAsync } = require("set-interval-async/dynamic")

let i = 1

setIntervalAsync(() => {
    console.log(roli.isBanned, i)
    if (!roli.isBanned) {
        roli.setBan()
    }
    i+=1
}, 100) */

import { config } from 'dotenv';
config()

import { getItems } from './api/robloxMarket.js';
import * as roli from './api/rolimons.js'
import calcPerathax from './modules/perathax.js'

let resp2 = await roli.getTable()
let truncatedTable = calcPerathax(resp2).slice(0,99)
console.log(truncatedTable)
let resp3 = await getItems(truncatedTable)

console.log(resp3)
