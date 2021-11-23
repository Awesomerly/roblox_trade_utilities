import * as self from '../api/robloxSelf.js'
import obj from '../modules/objects.js'

let fired
async function doOnce() {
    if (fired) return
    fired = true
    
    let userInfo = await self.getAuthInfo()

    obj.MyInfo.id = userInfo.id
    obj.MyInfo.name = userInfo.name
    obj.MyInfo.displayName = userInfo.displayName
}

async function routine() {
    await doOnce()

    let robux = await self.getRobux()
    obj.MyInfo.robux = robux

    console.log(obj.MyInfo)
}

export default routine