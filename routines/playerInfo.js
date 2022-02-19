import * as rbx from '../api/roblox.js'
import obj from '../modules/objects.js'

let fired
async function doOnce() {
    if (fired) return
    fired = true
    
    let userInfo = await rbx.self.getAuthInfo()
    if (userInfo.errors) {
        if (userInfo.errors[0].code == 0) {
            console.error("\x1b[31mYour Roblox cookie is invalid.\x1b[0m")
        } else {
            console.error("\x1b[31mGetting user details failed.\x1b[0m")
        }
        process.exit(1)
    }

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
