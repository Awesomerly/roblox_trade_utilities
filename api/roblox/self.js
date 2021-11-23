import { request } from './auth.js'

export async function getRobux() {
    let response = await request('https://api.roblox.com/currency/balance')
        .then(res => res.json())
        
    return response.robux
}

// Returns userId, username, displayName
export async function getAuthInfo() {
    return await request('https://users.roblox.com/v1/users/authenticated')
        .then(res => res.json())
}