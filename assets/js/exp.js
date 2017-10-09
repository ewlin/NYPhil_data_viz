let composers = []; 
let buckets = {}; 

d3.json('../../data/composers.json', (d) => {
	d.forEach( composer => {
		let totalPerfs = 0; 
		composer.works.forEach( work => {
			totalPerfs += work.seasons.length; 
		}); 
		if (totalPerfs > 2 && composer.death && composer.death > 1852 && composer.death < 2007) composers.push(composer); 
	}); 
	console.log(d.length); 
	console.log(composers); 
	
	composers[0].works.forEach( work => {
		let seasons = work.seasons; 
		seasons.forEach( season => {
			//make sure to generalize to change composers' death dates...
			let diff = parseInt(season) - composers[0].death; 
			let index = Math.floor(diff/10); 
			//Deal with Year of Death i.e. 0, bug
			//if (diff >= 0) {
			//	index = Math.ceil(diff/10); 
			//} else {
			//	index = Math.floor(diff/10); 
			//}
			if (!buckets[index]) {
				buckets[index] = 1; 
			} else {
				buckets[index] += 1; 
			}
		}); 
	}); 
}); 


		 
			