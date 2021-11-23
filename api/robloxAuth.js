import fetch from "node-fetch"
let csrf = ""

// TODO: have a module that imports all of these apis

// I love plagarism
// https://robloxapi.wiki/wiki/X-CSRF-Token#JavaScript_(with_Node.js)_-c7d10c
export async function request(url, options) {
    const response = await fetch(url, {
        headers: {
            Cookie: `.ROBLOSECURITY=${process.env.ROBLOSECURITY};`,
            "x-csrf-token": csrf,
            "Content-Type": "application/json"
        },
        ...options
    });

    if (response.status == 403) {
        if (response.headers.has("x-csrf-token")) {
            csrf = response.headers.get("x-csrf-token");
            return request(url, options);
        }
    }

    return response;
}


export async function refreshCsrf() {
    await rbxRequest("https://auth.roblox.com", {
        method: "POST"
    });
}

