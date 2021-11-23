import * as roli from '../api/rolimons.js'
import obj from '../modules/objects.js'
import { calcPerathax } from '../modules/perathax.js'

let firedCount = 0
async function doFirst() {
    if (firedCount > 0) return
    await perathaxBehavior()
}

async function perathaxBehavior() {
    obj.PerathaxList = calcPerathax(await roli.getTable())
}

async function routine() {
    await doFirst()
    if (firedCount == 600) {
        firedCount = 0
        await perathaxBehavior()
    }

    obj.ItemsList = await roli.getItems()
    firedCount += 1
}

export default routine