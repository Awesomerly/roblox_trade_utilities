import { request } from './auth.js'

const baseUrl = "https://privatemessages.roblox.com"

export async function getInboundMessages(pageNumber) {
    const url = `${baseUrl}/v1/messages?messageTab=inbox&pageNumber=`
    return await request(url + pageNumber)
}

export async function archiveMessages(messageArray) {
    const url = baseUrl + "/v1/messages/archive"
    const body = {
        "messageIds": messageArray
    }

    return await request(url, { 
        method: 'POST',
        body: JSON.stringify(body)
    })
}