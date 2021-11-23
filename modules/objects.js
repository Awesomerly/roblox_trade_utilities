// TODO: move a bunch of this into redis or some equivalent
const info = {
    // Various current player information bits
    MyInfo: {
        name: "",
        displayName: "",
        id: "",
        robux: ""
    },

    // Cumulative items list (sourced from various roblox and rolimons apis)
    // TODO: add a comment stating what can be in here
    ItemsList: {},

    PerathaxList: []
}

export default info