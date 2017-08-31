//data process to get # of works performed each season by living vs. deceased composers 
let seasons = {}, 
		percentagesLivingDead, 
		percentagesFirstRepeat; 

//generate seasons dynamically
const ALL_SEASONS = generateSeasons(1842, 2016); 

function generateSeasons (start, end) {
	let seasons = []; 
	
	for (let i=start; i<=end; i++) {
		let nextSeas = String(i+1).slice(2,4);
		seasons.push(String(`${i}-${nextSeas}`)); 
	}
	
	return seasons; 
}


d3.json('../../data/composers.json', (err, d) => {
	
	d.forEach(composer => {
		let works = composer.works, //[] of work objects
				birth = composer.birth, 
				death = composer.death; 
		
		
		works.forEach(work => {
			work.seasons.forEach( (season, idx) => {
				//first time encountering season, should add object to object with season as key; 
				
				if (!seasons[season]) {
					seasons[season] = {
						alive: 0, 
						dead: 0, 
						unknown: 0, 
						first: 0, 
						repeat: 0
					}
				}
				
				//composer of work dead or alive during season (if composer died during season, consider alive)
				let perfYear = parseInt(season); 
				
				if (birth == null && death == null) {
					++seasons[season]["unknown"] 
				} else if (death) {
					perfYear > death 
						? ++seasons[season]["dead"]
						: ++seasons[season]["alive"]; 
				} else {
					++seasons[season]["alive"];
				}
			
				// quick + dirty way to grab whether a first performance or repeat
				idx == 0 ? ++seasons[season]["first"] : ++seasons[season]["repeat"]
				
			}); 
		}); 
		
	}); 
	
	//Debugging 
	console.log(seasons); 
	
	percentagesLivingDead = ALL_SEASONS.map(season => {
		let {unknown, alive, dead} = seasons[season], 
				total = unknown + alive + dead; 
		
		return {
			season: season, 
			total: total, 
			percentageAlive: alive/total, 
			percentageDead: dead/total
		}
	}); 
	
	percentagesFirstRepeat = ALL_SEASONS.map(season => {
		let {first, repeat} = seasons[season], 
				total = first + repeat; 
		
		return {
			season: season,
			total: total, 
			percentageFirst: first/total, 
			percentageRepeat: repeat/total
		}
		
	}); 
	
	console.log(movingAverageOfProps(percentagesLivingDead, ["percentageAlive", "percentageDead"]));
	console.log(movingAverageOfProps(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"]))
	//console.log(d3.max(percentages, d => d.percentageAlive));
	//console.log(d3.min(percentages, d => d.percentageAlive));
	
}); 

function movingAverageOfProps(array, keys) {
	return array.map( (item, idx) => {
		let beginIndex = idx-4 >= 0 ? idx-4 : 0, 
				endIndex = idx+5, 
				collection = array.slice(beginIndex, endIndex), 
				collLength = collection.length, 
				movingAvgs = {}; 
		
		keys.forEach(key => {
			movingAvgs[key] = collection.reduce( (sum, val) => sum + val[key], 0)/collLength; 
		})
		
		return Object.assign({season: item.season}, movingAvgs); 
	}); 
}

