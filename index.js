let roli = require("./api/rolimons")
let { setIntervalAsync } = require("set-interval-async/dynamic")

let i = 1

setIntervalAsync(() => {
    console.log(roli.isBanned, i)
    if (!roli.isBanned) {
        roli.setBan()
    }
    i+=1
}, 100)