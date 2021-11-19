import fetch from "node-fetch"
let csrf = ""

// I love plagarism
// https://robloxapi.wiki/wiki/X-CSRF-Token#JavaScript_(with_Node.js)_-c7d10c
export const request = async (url, options) => {
    const response = await fetch(url, {
        headers: {
            Cookie: `.ROBLOSECURITY=${process.env.ROBLOSECURITY};`,
            "x-csrf-token": csrf,
        },
	...options
    });

    if (response.status == 403) {
        if (response.headers.has("x-csrf-token")) {
            csrf = response.headers.get("x-csrf-token");
            return rbxRequest(url, options);
        }
    }

    return response;
};


export const refreshCsrf = async () => {
	await rbxRequest("https://auth.roblox.com", {
		method: "POST"
	})
}

