import { setIntervalAsync } from 'set-interval-async/dynamic/index.js'
import cfg from '../config.js'

import playerInfoRoutine from './playerInfo.js'
import roliRoutine from './rolimons.js'
import getSnipes from './snipes.js'
import declineBots from './trades.js'
import sell from './selling.js'
import getProdIds from './productIds.js'

async function start(fn, sec) {
    await fn()
    setIntervalAsync(fn, sec * 1000)
}

// TODO: ERROR HANDLING BASED OFF THE FAULTY COMPONENT

async function startEverything() {
        await start(playerInfoRoutine, 60)
        await start(roliRoutine, 20)

        await start(getProdIds, 60*10)

        if (cfg.snipes.enabled) await start(getSnipes, 0.78)
        if (cfg.selling.enabled) start(sell, 600)

        start(declineBots, 120)
}

export default startEverything
