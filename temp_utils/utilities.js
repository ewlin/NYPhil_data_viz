//d === {composer: "SomeLastName,  SomeFirstName  MiddleInitial"} 
//formatName => "SomeLastName, S." 

function formatName (d) { 
	let c = d.composer.split(","); 
	let first = c[0].match(/\[.*\]/) ? c[0].match(/\[.*\]/)[0].slice(1,c[0].match(/\[.*\]/)[0].length-1) : c[0]; 
	return `${first}, ${c[1].trim().slice(0,1)}.`; 
}



function findMax(composersArr) {
	return composersArr.reduce( (max, composer) => {
		let seasons = composer.seasons; 
		let highest = 0; 
		for (let season in seasons) {
			highest = seasons[season] > highest ? seasons[season] : highest; 
		}
		return max > highest ? max : highest; 
	}, 0); 
}