function generateSeasons (start, end) {
	let seasons = []; 
	
	for (let i = start; i <= end; i++) {
		let nextSeas = String(i + 1).slice(2, 4);
		seasons.push(String(`${i}-${nextSeas}`)); 
	}
	
	return seasons; 
}

module.exports = generateSeasons; 