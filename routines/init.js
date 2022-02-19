import cfg from '../config.js'

import playerInfoRoutine from './playerInfo.js'
import roliRoutine from './rolimons.js'
import getSnipes from './snipes.js'
import declineBots from './trades.js'
import sell from './selling.js'
import getProdIds from './productIds.js'
import archiveMessages from './messages.js'

//https://github.com/orlangure/set-interval-serial/blob/master/index.js
const setIntervalSerial = (callback, interval, runImmediately = false) => {
    let isRunning = runImmediately;
    runImmediately && setTimeout(async () => {
        runImmediately && await callback();
        isRunning = false;
    }, 1);
    return setInterval(async () => {
        if (isRunning) {
            return;
        }
        isRunning = true;
        await callback();
        isRunning = false;
    }, interval);
};

async function start(fn, sec) {
    await fn()

    setIntervalSerial(async () => (
        fn().catch((err) => { 
            console.error(err)
            process.exit(1)
        })
    ), sec * 1000, true)
}

// TODO: ERROR HANDLING BASED OFF THE FAULTY COMPONENT

async function startEverything() {

        console.log("Getting player info...")
        await start(playerInfoRoutine, 60)

        console.log("Getting values...")
        await start(roliRoutine, 20)

        console.log("Getting product id list...")
        await start(getProdIds, 60*10)

        
        if (cfg.snipes.enabled) {
            console.log("Starting sniper...")
            await start(getSnipes, 1)
        }

        console.log("Starting trade processing...")
        await start(declineBots, 60)

        if (cfg.messageArchiver.enabled){
            console.log("Starting message archival...")
            await start(archiveMessages, 20)
        } 
        if (cfg.selling.enabled) {
            console.log("Starting price warrer...")
            await start(sell, 300)
        } 

        console.log("Everything seems good to go :)")
}

export default startEverything
