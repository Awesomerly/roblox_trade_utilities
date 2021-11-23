import { setIntervalAsync } from 'set-interval-async/dynamic/index.js'

import playerInfoRoutine from './playerInfo.js'
import roliRoutine from './rolimons.js'

async function start(fn, ms) {
    await fn()
    setIntervalAsync(fn, ms)
}

// TODO: ERROR HANDLING BASED OFF THE FAULTY COMPONENT

async function startEverything() {
        await start(playerInfoRoutine, 60000)
        await start(roliRoutine, 20000)
}

export default startEverything