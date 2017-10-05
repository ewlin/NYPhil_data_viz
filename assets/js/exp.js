d3.json('../../data/composers.json', (d) => {
	let composers = []; 
	d.forEach( composer => {
		let totalPerfs = 0; 
		composer.works.forEach( work => {
			totalPerfs += work.seasons.length; 
		}); 
		if (totalPerfs > 2 && composer.death && composer.death > 1852 && composer.death < 2007) composers.push(composer); 
	}); 
	console.log(d.length); 
	console.log(composers); 
}); 

