import { setIntervalAsync } from 'set-interval-async/dynamic/index.js'

import playerInfoRoutine from './playerInfo.js'
import roliRoutine from './rolimons.js'
import getSnipes from './snipes.js'
import declineBots from './trades.js'

async function start(fn, sec) {
    await fn()
    setIntervalAsync(fn, sec * 1000)
}

// TODO: ERROR HANDLING BASED OFF THE FAULTY COMPONENT

async function startEverything() {
        await start(playerInfoRoutine, 60)
        await start(roliRoutine, 20)
        await start(getSnipes, 0.79)
        await start(declineBots, 60 * 2)
}

export default startEverything
