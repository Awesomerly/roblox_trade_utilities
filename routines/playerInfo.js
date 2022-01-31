import * as rbx from '../api/roblox.js'
import obj from '../modules/objects.js'

let fired
async function doOnce() {
    if (fired) return
    fired = true
    
    let userInfo = await rbx.self.getAuthInfo()

    obj.MyInfo.id = userInfo.id
    obj.MyInfo.name = userInfo.name
    obj.MyInfo.displayName = userInfo.displayName
}

async function routine() {
    await doOnce()

    await rbx.refreshCsrf()

    let myRobux = await rbx.self.getRobux()
    if (myRobux.errors) return
    obj.MyInfo.robux = myRobux
}

export default routine