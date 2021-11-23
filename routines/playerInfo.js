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

    let robux = await rbx.self.getRobux()
    obj.MyInfo.robux = robux
}

export default routine