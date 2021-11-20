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

import * as rbx from './api/robloxAuth.js'
import * as roli from './api/rolimons.js'

let resp = await rbx.request("https://economy.roblox.com/v1/users/16651514/currency", {
	method: "GET"
})

let resp2 = await roli.getTable()

console.log(await resp.json())
console.log(resp2)
