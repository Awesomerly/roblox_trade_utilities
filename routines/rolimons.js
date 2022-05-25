import * as roli from '../api/rolimons.js'
import obj from '../modules/objects.js'
import { calcPerathax } from '../modules/perathax.js'

let firedCount = 0

async function updateTable() {
    if (firedCount > 0) return
    if (firedCount >= 120) firedCount = 0

    const table = await roli.getTable()
    if (table.success == true) {
        obj.PerathaxList = calcPerathax(table.data)
    }
}

async function routine() {
    await updateTable()

    const itemsResp = await roli.getItems()

    if (itemsResp.success == true) {
        obj.ItemsList = itemsResp.items
    }

    firedCount += 1
}

export default routine
