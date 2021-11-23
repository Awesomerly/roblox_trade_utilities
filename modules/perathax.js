export function calcPerathax(table) {
	// default value: 22
	// available: 11 - 12
	let truncated = []
	for (const [key, value] of Object.entries(table)) {
		const itemTrunc = {
			id: key,
			value: value[22],
			available: value[11] - value[12],
			name: value[0]
		}
		truncated.push(itemTrunc)
	}
	let perathax = truncated.sort((a, b) => a.value - b.value)
		// assign cheapness level
		.map((elem, idx) => { elem.cheapness = idx + 1; return elem })
		// sort by rarity
		.sort((a, b) => b.available - a.available)
		// assign rarity value
		.map((elem, idx) => { elem.rarity = idx + 1; return elem })
		// assign perathax ranking
		.map((elem) => { elem.peraRank = elem.cheapness / elem.rarity; return elem })
		// sort by perathax
		.sort((a, b) => b.peraRank - a.peraRank)
		// take out everything that isn't id 

	return perathax
}

export function perathaxToBody(table) {
		return table.map((elem) => {
			return {
				itemType: "Asset",
				id: elem.id
			}
		})
}
