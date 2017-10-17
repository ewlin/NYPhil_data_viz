d3.json('../../data/composers.json', (d) => {
	let composers = []; 
	let composerSubset = []; 
	d.forEach( composer => {
		let totalPerfs = 0; 
		composer.works.forEach( work => {
			totalPerfs += work.seasons.length; 
		}); 
		if (totalPerfs > 2 && composer.death && composer.death > 1852 && composer.death < 2007) composers.push(composer); 
	}); 
	console.log(d.length); 
	console.log(composers); 
	
	composers.forEach( (composer, idx) => {
		let composerWorks = composer.works; 
		let composerBucket = {composer: composer.composer, buckets: {}}; 
		composerWorks.forEach( work => {
			let seasons = work.seasons; 
			seasons.forEach( season => {
				//make sure to generalize to change composers' death dates...
				//
				let diff = parseInt(season) - composer.death - 1; //OR not include -1? 
				let index = Math.floor(diff/10); 
				//Deal with Year of Death i.e. 0, bug
				//if (diff >= 0) {
				//	index = Math.ceil(diff/10); 
				//} else {
				//	index = Math.floor(diff/10); 
				//}
				if (!composerBucket['buckets'][index]) {
					composerBucket['buckets'][index] = 1; 
				} else {
					composerBucket['buckets'][index] += 1; 
				}
			}); 
		});
		composerSubset.push(composerBucket); 
	}); 
	
	console.log(composerSubset); 
}); 


/*
let updatedTopComposers = []; 
d3.queue()
	.defer(d3.json, '../../data/composers.json')
	.defer(d3.json, '../../data/top60_alt.json')
	.await(function(err, allComposers, top60) {
		top60.forEach( composer => {
			console.log(composer.composer, allComposers.findIndex( person => person.composer == composer.composer)); 
			let index = allComposers.findIndex( person => person.composer == composer.composer ); 
			let {birth, death} = allComposers[index]; 
			updatedTopComposers.push(Object.assign(composer, {birth: birth, death: death})); 
		}); 
	}); 
*/
			