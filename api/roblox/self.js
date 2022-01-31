import { request } from './auth.js'

export async function getRobux() {
    let response = await request('https://api.roblox.com/currency/balance')
    if (response.errors) {
        return response
    }
    return response.robux
}

// Returns userId, username, displayName
export async function getAuthInfo() {
    return await request('https://users.roblox.com/v1/users/authenticated')
}