import { request } from '../api/roblox.js'

export async function paginate(url) {
    let result = []

    let nextPageCursor = ' '

    let getPages = async () => {
        while (nextPageCursor) {
            let resp = await request(url + `&cursor=${nextPageCursor}`)
                .then(x => x.json())

            result.push(...resp.data)
            nextPageCursor = resp.nextPageCursor
            await sleep(200)
        }
    }

    await getPages()
    return result
}

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function randomIndex(array) {
    return array[Math.floor(Math.random() * array.length)];
}

export function timeLog(string) {
    const date = new Date()
    const curTime = date.toLocaleTimeString('it-IT')

    console.log(`[${curTime}] ` + string)
}