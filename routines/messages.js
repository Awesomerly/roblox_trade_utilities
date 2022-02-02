import { timeLog, sleep } from '../modules/utils.js'
import config from '../config.js'
import * as rbx from '../api/roblox.js'

const archiveBatch = 20
const dateThreshold = config.messageArchiver.dateThreshold
const pagesToSearch = config.messageArchiver.pagesToSearch

export default async function routine() {
    const regex = /[Tt]rade/g

    let page = await rbx.messages.getInboundMessages(0)
    
    let msgIdArray = []
    for (let curPageNum = 0; curPageNum < pagesToSearch; curPageNum++) {
        if (curPageNum != 0) {
            page = await rbx.messages.getInboundMessages(curPageNum)
        }

        if (page.errors) {
            timeLog("Ratelimited on messages endpoint")
            await sleep(60000)
            continue
        }

        for (const message of page.collection) {
            if (Date.parse(message.created) < dateThreshold) {
                break
            }

            if (message.isSystemMessage &&
                message.subject.match(regex)) {
                    msgIdArray.push(message.id)
                }
        }

        await sleep(100)
    }

    // dedupe through array -> set -> array conversion
    msgIdArray = [...new Set(msgIdArray)]
    if (msgIdArray.length > 0) {
        timeLog(`Archived ${msgIdArray.length} messages.`)
    }

    const archiveLoopCnt = Math.ceil(msgIdArray.length / archiveBatch)
    for (let tmp = 0; tmp < archiveLoopCnt; tmp++) {
        const group = msgIdArray.splice(0, archiveBatch)
        const archiveResp = await rbx.messages.archiveMessages(group)
        if (archiveResp.errors) {
            await sleep(100)
            continue
        }

        await sleep(100)
    }
}