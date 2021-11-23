import * as roli from '../api/rolimons.js'
import obj from '../modules/objects.js'
import perathax from '../modules/perathax.js'

let firedCount = 0
async function doFirst() {
    if (firedCount > 0) return

    obj.PerathaxList = perathax(await roli.getTable())
}

async function routine() {
    await doFirst()
    if (firedCount == 600) {
        firedCount = 1
        obj.PerathaxList = perathax(await roli.getTable())
        return
    }

    firedCount += 1
    obj.ItemsList = await roli.getItems()
}

export default routine