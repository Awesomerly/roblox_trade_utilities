const config = 
{
    items: {
        keep: {
            serials: [1, 69],
            assetIds: [
                1323367, // IH
                1073690, // JJ
                2215797, // EH
                1193866, // CC
                1286490, // DB
                3271938, // ring
                5162497, // HT
                319655275, // Undersmeller
                7893468574, // Zara
            ],
            uaids: [
                1830733382 // CTH
            ],
            //fiveDigitUaids: true,
        }
    },

    // Item Selling Config
    selling: {
        enabled: true,

        /* Thresholds determine limits on sale prices.

           The seller always lists items above min,
           above med if found within medSearch listings
           other than your own, and below max.
        */
        threshold: {
            min: 1,
            max: 4,
        }
    },

    // Snipe Bot Config
    snipes: {
        enabled: true,

        minPercent: 40,
        maxPercent: 70,
        // min percentage for price change to be logged
        displayPercent: -30,

        // will there be RAP items included from the request?
        snipeRap: false,

        // range of items from perathax to send:
        peraRange: [ 0, 100 ]
    }
}

export default config
