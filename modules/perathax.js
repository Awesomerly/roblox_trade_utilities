const calcPerathax = (table) => {
	// default value: 22
	// available: 11 - 12
	let truncated = []
	for (const [key, value] of Object.entries(table)) {
		const itemTrunc = {
			id: key,
			value: value[22],
			available: value[11]-value[12],
			name: value[0]
		}
		truncated.push(itemTrunc)
	}
	let perathax= truncated.sort((a, b) => a.value - b.value)
			  .map((elem, idx) => { elem.cheapness = idx + 1; return elem })
	                  .sort((a, b) => b.available - a.available)
			  .map((elem, idx) => { elem.rarity = idx + 1; return elem})
			  .map((elem) => { elem.peraRank = elem.cheapness / elem.rarity; return elem })
			  .sort((a, b) => b.peraRank - a.peraRank)

	return perathax 
}

export default calcPerathax
