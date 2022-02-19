import fetch from "node-fetch"
let csrf = ""

// TODO: enable multi cookie drifting

// I love plagarism
// https://robloxapi.wiki/wiki/X-CSRF-Token#JavaScript_(with_Node.js)_-c7d10c
export async function request(url, options, cookie = process.env.ROBLOSECURITY) {
    const response = await fetch(url, {
        headers: {
            Cookie: `.ROBLOSECURITY=${cookie};`,
            "x-csrf-token": csrf,
            'Content-Type': 'application/json'
        },
        ...options
    });

    if (response.status == 403) {
        if (response.headers.has("x-csrf-token")) {
            csrf = response.headers.get("x-csrf-token");
            return request(url, options);
        }
    }

    let respText = await response.text()
    let returnedResp
    try {
        returnedResp = JSON.parse(respText)
    } catch {
        returnedResp = { 
            errors: [
                {
                    code: response.status,
                    message: "HTML Error"
                }
            ]
        }
    }

    // yay for redundant logic :3
    if (!response.ok && response.status != 403) {
        console.warn(url, returnedResp.errors[0].code, returnedResp.errors[0].message)
    }

    return await returnedResp

}


export async function refreshCsrf() {
    await request("https://auth.roblox.com", {
        method: "POST"
    });
}

