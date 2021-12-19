const config = 
{
    selling: {
        enabled: true,
    },

    snipes: {
        enabled: true,

        minPercent: 40,
        maxPercent: 70,
        // min percentage for price change to be logged
        displayPercent: 0,

        // will there be RAP items included from the request?
        snipeRap: true,

        // range of items from perathax to send:
        peraRange: [ 50, 150 ]
    }
}

export default config
