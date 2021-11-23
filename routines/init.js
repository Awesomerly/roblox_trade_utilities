import { setIntervalAsync } from 'set-interval-async/dynamic/index.js'

import playerInfoRoutine from './playerInfo.js'
import roliRoutine from './rolimons.js'

async function start(fn, ms) {
    const randomMs = ms + (0.008 * ms * Math.random())
    console.log(`MS: ${randomMs}`)
    await fn()
    setIntervalAsync(fn, randomMs)
}

async function startEverything() {
        await start(playerInfoRoutine, 60000)
        await start(roliRoutine, 20000)
}

export default startEverything