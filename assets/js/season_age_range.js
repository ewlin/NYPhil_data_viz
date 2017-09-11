//data process to get # of works performed each season by living vs. deceased composers 
let seasons = {}, 
		percentagesLivingDead, 
		percentagesFirstRepeat, 
		percentagesOfRepeatsLiving, 
		transition, 
		seasonsBuckets = Array.apply(null,Array(7)).map((_) => {
			return {}; 
		});

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

function group (array, numPerGroup) {
	numPerGroup = numPerGroup || array.length; 
	let groups = []; 
	
	while (array.length) {
		groups.push(array.slice(0,numPerGroup)); 
		array = array.slice(numPerGroup); 
	}
	
	return groups; 
}

d3.json('../../data/composers.json', (err, d) => {
	
	d.forEach( (composer, composerIdx) => {
		let works = composer.works, //[] of work objects
				birth = composer.birth, 
				death = composer.death; 
		
		
		works.forEach((work, workIdx) => {
			let workID = composerIdx + ":" + workIdx; 
			
			work.seasons.forEach( (season, idx) => {
				//first time encountering season, should add object to object with season as key; 
				
				if (!seasons[season]) {
					seasons[season] = {
						repeat: 0, 
						repeatAlive: 0, 
						alive: 0, 
						dead: 0, 
						unknown: 0, 
						first: 0, 
						composers: {}
					}
				}
				
				//composer of work dead or alive during season (if composer died during season, consider alive)
				let perfYear = parseInt(season); 
				
				if (birth == null && death == null) {
					++seasons[season]["unknown"] 
				} else if (death) {
					perfYear > death 
						? ++seasons[season]["dead"]
						: (++seasons[season]["alive"], idx != 0 ? ++seasons[season]["repeatAlive"] : void 0); 
				} else {
					++seasons[season]["alive"];
					idx != 0 ? ++seasons[season]["repeatAlive"] : void 0; 
				}
			
				// quick + dirty way to grab whether a first performance or repeat
				idx == 0 ? ++seasons[season]["first"] : ++seasons[season]["repeat"]
				
				// sort compositions into season buckets
				
				let bucket = Math.floor((perfYear-1842)/25); 
				
				//Here's where the bug is happening. UPDATE: Fixed
				seasonsBuckets[bucket][workID] 
					? ++seasonsBuckets[bucket][workID]["count"]
					: seasonsBuckets[bucket][workID] = {title: work.title, composer: composer.composer, count: 1}; 
				
				
				//Calculate either age of living composers, or how long ago the composer died 
				
				if (!seasons[season]["composers"][composerIdx]) {
					//calculate age: Number. if alive (positive), if dead (negative)
					let ageDuringSeason; 
					
					if (birth == null && death == null) {
						ageDuringSeason = null; 
					} else if (death != null || (death == null && birth)) {
						ageDuringSeason = ((death == null && birth) || death >= perfYear) 
							? perfYear - birth 
							: death - perfYear; 
					}
					
					seasons[season]["composers"][composerIdx] = {
						composer: composer, 
						ageDuringSeason: ageDuringSeason, 
						numberOfPieces: 1
					}
				} else {
					++seasons[season]["composers"][composerIdx]["numberOfPieces"]; 
				}
				
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
	
	percentagesOfRepeatsLiving = ALL_SEASONS.map(season => {
		let {repeatAlive, repeat} = seasons[season]; 
		
		repeat = repeat == 0 ? 1 : repeat; 
		
		return {
			season: season, 
			percentageOfRepeatsLiving: repeatAlive/repeat * 100 
		}
	}); 
	
	percentagesOfAllRepeatsLiving = ALL_SEASONS.map(season => {
		let {repeatAlive, repeat, alive} = seasons[season]; 
		
		total = repeat + alive; 
		
		return {
			season: season, 
			percentageOfTotalRepeatsLiving: repeatAlive/total * 100 
		}
	}); 
	
	console.log(movingAverageOfProps(percentagesLivingDead, ["percentageAlive", "percentageDead"]));
	console.log(movingAverageOfProps(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"])); 
	console.log(percentagesOfRepeatsLiving); 
	console.log(percentagesOfAllRepeatsLiving); 


	
	
	
	
	
	
	//array-ify season buckets so I can sort 
	let sortedSeasonBuckets = seasonsBuckets.map(bucket => {
		let arr = []; 
		for (let id in bucket) {
			arr.push([id, bucket[id]]); 
  	}
		return arr; 
	})
	
	sortedSeasonBuckets.forEach(bucket => {
		bucket.sort((a,b) => b[1].count - a[1].count); 
	}); 
	
	console.log(sortedSeasonBuckets); 
	
	//update to include upto a certain position 
	//slice until logic. 1) remove US anthem 2) Keep taking until you hit next most often. If number 15 has 10 performances, take the rest of the pieces with at least 10 performances even if that results in more than 15 total pieces for that bucket. 
	console.log(sortedSeasonBuckets.map((bucket,idx) => {
		let fifteenth = bucket[14];
		
		let count = fifteenth[1].count; 
		
		let lastIndex = 0; 

		let currentCount = bucket[lastIndex][1].count; 
				
		while (currentCount >= count) {
			++lastIndex; 
			currentCount = bucket[lastIndex][1].count; 
		}
		console.log(lastIndex); 	
		return bucket.slice(0,lastIndex).map(arr => {
			return [arr[0], arr[1].title, arr[1].composer, arr[1].count]; 
		}); 
	})); 
	
	
	///End Data Processing 
	///Begin Streamgraph rendering 
	
	const SVG_HEIGHT = 600;
	const SVG_WIDTH = 1200;
	
	const SVG = d3.select(".container")
		.append("svg")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", SVG_WIDTH)
		.attr("height", SVG_HEIGHT)
		.attr("transform", "translate(0,30)");
	
	//let xScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]).padding("3px"); 
	//let yScale = d3.linearScale().domain([-1,1]).range([])
	let x = d3.scaleLinear().domain([0,174]).range([0,SVG_WIDTH]); 
	let y = d3.scaleLinear().domain([0,1]).range([SVG_HEIGHT, 0]);
	
	let stack = d3.stack()
		.keys(["percentageAlive", "percentageDead"]); 	
	
	let stackA = d3.stack()
		.keys(["percentageFirst", "percentageRepeat"]); 	
	
	let area = d3.area()
		.curve(d3.curveCardinal.tension(.1))
		.x((d, i) => x(i) )
		.y0(d => y( d[0]) )
		.y1(d => y( d[1]) ); 
	
	SVG.selectAll("path")
  //.data(stack1(movingAverageOfProps(statsPerc1)))
	.data(stack(movingAverageOfProps(percentagesLivingDead, ["percentageAlive", "percentageDead"])))
  .enter().append("path")
    .attr("d", area)
		.attr("fill", (d) => {
			if (d.key == "percentageAlive") return "Tomato";
			if (d.key == "percentageDead") return "Steelblue";
		});
	//.attr("stroke", "Black"); 
	
	
	
	
	transition = function() {
		let newStuff = SVG.selectAll("path")
			.data(stackA(movingAverageOfProps(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"])));
		
		//newStuff.exit().remove()//.attr("d",areaInit)//.attr("fill", (d) => {
				//if (d.key == "pctFirstSingle") return "Steelblue";
				//if (d.key == "pctFirstMult") return "Tomato";
				//if (d.key == "pctRepeat") return "#59273e";
		//})
		newStuff.transition().duration(1000).attr("d", area).attr("fill", (d) => {
			if (d.key == "percentageFirst") return "Tomato";
			if (d.key == "percentageRepeat") return "Steelblue";
		});

			//.attr("d", area)
		//.attr("fill", (d) => {
		//		if (d.key == "pctFirstSingle") return "Steelblue";
		//		if (d.key == "pctFirstMult") return "Tomato";
		//		if (d.key == "pctRepeat") return "Grey";
		//}); 

	}
	
	document.getElementById("buttons").addEventListener("click", (e) => {
		let target = e.target; 
		if (target.id === "transition") transition(); 
		//if (target.id === "transition-back") transition2(); 
	}); 
	
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






let composersAlive = {}; 
let medianAges = []; 
for (let year in seasons) {
  let composers = seasons[year]["composers"]; 
  let alive = []; 
	let averageAge; 
	let medianAge; 
	//console.log(composers); 
	for (let comp in composers) {
		//console.log(composers[comp].ageDuringSeason); 
		if (composers[comp].ageDuringSeason > 0) {
			alive.push(composers[comp].ageDuringSeason); 
		}
	}
	//console.log(alive); 
	averageAge = alive.reduce( (sum, age) => sum + age )/alive.length; 
	medianAges.push(alive[Math.floor(alive.length/2)]); 
	//composersAlive[year] = {averageAge: alive}; 
}

