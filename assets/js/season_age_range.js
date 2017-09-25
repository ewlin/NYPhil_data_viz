//data process to get # of works performed each season by living vs. deceased composers 
let seasons = {}, 
		percentagesLivingDead, 
		percentagesFirstRepeat, 
		percentagesOfRepeatsLiving, 
		totalWorksPerSeason, 
		transition, 
		transitionOrg, 
		transition2, 
		seasonsBuckets = Array.apply(null,Array(7)).map((_) => {
			return {}; 
		});

let sorted; 

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
			
			//create custom composition ID number 
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
	
	totalWorksPerSeason = ALL_SEASONS.map(season => {
		let {first, repeat} = seasons[season], 
				total = first + repeat; 
		
		return {
			season: season,
			total: total, 
			first: first, 
			repeat: repeat
		}
	}); 
	
	const MAX_NUMBER_PER_SEASON = totalWorksPerSeason.reduce( (best, current) => {
		return best > current.total ? best : current.total; 
	}, 0); 
	
	console.log(MAX_NUMBER_PER_SEASON)
	
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
	
	console.log((movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 7))); 
	//console.log(movingAverageOfProps(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"])); 
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
	
	sorted = sortedSeasonBuckets; 
	//Add rankings Done!!!
	let rankings = sortedSeasonBuckets.map(bucket => {
		let currentRank = 1; 
		let currentCount = bucket[0][1].count;
		let withSameCount = 0; 
		
		return bucket.map(composition => {
			
			let compositionCount = composition[1].count; 
		
			if (currentCount !== compositionCount) {
				currentRank += withSameCount; 
				currentCount = compositionCount; 
				withSameCount = 1; 
			} else {
				withSameCount++; 
			}
			return composition.concat(currentRank); 
		}); 
	}); 
	
	//generalized solution to ranking items in an array
	//assuming array is of objects with some id AND a value to rank by
	
	//so far, this assumes the array is already sorted 
	function ranking(array,  /* array of arrays */accessor) {
		let currentRank = 1, 
				//currentValue = array[0][1].count, //initial value from first item in array
				currentValue = accessor.call(null, array[0]), 
				withSameValue = 0; 
		
		return array.map(item => {
			let itemValue = accessor.call(null, item); //again, use acessor function to grab this 
			
			if (itemValue !== currentValue) {
				currentRank += withSameValue; 
				currentValue = itemValue; 
				withSameValue = 1; 
			} else {
				withSameValue++; 
			}
			
			return item.concat(currentRank); 
		}); 
	}
	
	//
	
	
	
	console.log(rankings); 
	
	//update to include upto a certain position 
	//slice until logic. 1) remove US anthem 2) Keep taking until you hit next most often. If number 15 has 10 performances, take the rest of the pieces with at least 10 performances even if that results in more than 15 total pieces for that bucket. 
	
	//sortedSeasonBuckets.forEach((bucket,idx) => {
	//	let total = bucket.reduce((sum, piece) => {
	//		return sum + piece[1].count; 
	//	}, 0);
	//	console.log(idx);
	//	console.log(total);
	//});
	//let top15 = sortedSeasonBuckets.map((bucket,idx) => {

	let top15 = rankings.map((bucket,idx) => {
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
			return [arr[0], arr[1].title, arr[1].composer, arr[1].count, arr[2]]; 
		}).filter(arr => arr[2] !== "Anthem,"); 
	}); 
	
	console.log(top15);
	
	top15[2].forEach( (piece) => {
		let composer = piece[2], 
				composerImage = composer.toLowerCase().split(" ")[0].match(/[a-z]*/)[0] + '.png', 
				title = piece[1], 
				count = piece[3], 
				rank = piece[4]; 
		
		let imageCell = `<td><img src='assets/images/composer_sqs/${composerImage}'/></td>`, 
				freqCell = `<td>${count}</td>`, 
				titleCell = `<td class="titles">${title}</td>`, 
				composerCell = `<td><img src='assets/images/composer_sqs/${composerImage}'/>${composer}</td>`, 
				rankCell = `<td>${rank}</td>`, 
				row = `<tr>${imageCell}${rankCell}${titleCell}${composerCell}${freqCell}</tr>`; 
		
		//console.log(row); 
		
		$('.comp-rankings').append(`<tr>${rankCell}${titleCell}${composerCell}${freqCell}</tr>`); 
		
	}); 
	let top15Composers = []; 
	top15.forEach(bucket => {
		bucket.forEach(comp => {
			if (!top15Composers.includes(comp[2])) top15Composers.push(comp[2]); 
		})
	}); 
	
	console.log(top15Composers); 
	
	
	///End Data Processing 
	///Begin Streamgraph rendering 
	
	console.log("width: ")
	console.log($('.container').innerWidth()); 
	const PADDING = 25; 
	const SVG_HEIGHT = 480;
	const SVG_WIDTH = $('.container').innerWidth();
	
	const SVG = d3.select(".container")
		.append("svg")
		.attr("x", 0)
		.attr("y", 0)
		.attr("width", SVG_WIDTH)
		.attr("height", SVG_HEIGHT)
		.attr("transform", "translate(0,30)");
	
	//let xScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]).padding("3px"); 
	//let yScale = d3.linearScale().domain([-1,1]).range([])
	let x = d3.scaleLinear().domain([0,174]).range([0,.9*SVG_WIDTH]); 
	let y = d3.scaleLinear().domain([0,1]).range([SVG_HEIGHT-2*PADDING, 10]);
	
	let yAbs = d3.scaleLinear().domain([0,MAX_NUMBER_PER_SEASON]).range([SVG_HEIGHT-2*PADDING, 10]);
	let yPct = d3.scaleLinear().domain([0,1]).range([SVG_HEIGHT-2*PADDING, 10]);

	let stack = d3.stack()
		.keys(["percentageAlive", "percentageDead"]); 	
	
	let stackA = d3.stack()
		.keys(["percentageFirst", "percentageRepeat"]); 	
	
	let stackB = d3.stack()
		.keys(["first", "repeat"]); 	
	
	let areaAbsolute = d3.area()
		.curve(d3.curveCardinal.tension(.1))
		.x((d, i) => x(i) )
		.y0(d => yAbs( d[0]) )
		.y1(d => yAbs( d[1]) ); 
	
	let yAxisAbs = d3.axisLeft()
										.scale(yAbs)
										.tickSize(0); 
						 
	
	let yAxisPct = d3.axisLeft()
										.scale(yPct)
										.tickSize(0)
										.tickFormat( d => {
											return `${d*100}%`;  
										}); 
	
	let xAxisYear = d3.axisBottom()
										.scale(x)
										.tickSize(0)
	
	let areaPercentage = d3.area()
		.curve(d3.curveCardinal.tension(.1))
		.x((d, i) => x(i) )
		.y0(d => y( d[0]) )
		.y1(d => y( d[1]) ); 
	
	let area = d3.area()
		.curve(d3.curveCardinal.tension(.1))
		.x((d, i) => x(i) )
		.y0(d => y( d[0]) )
		.y1(d => y( d[1]) ); 
	
	
	SVG.selectAll("path")
		.data(stackB(totalWorksPerSeason))
  .enter().append("path")
		.attr("transform", `translate(${0.05*SVG_WIDTH},0)`)
    .attr("d", areaAbsolute)
		.attr("fill", (d) => {
			if (d.key == "first") return "Tomato";
			if (d.key == "repeat") return "Steelblue";
		});
	
	SVG.selectAll("text")
		.data(stackB(totalWorksPerSeason))
		.enter()
		.append("text")
		.attr("x", 300)
		.attr("y", (d, i) => Math.abs((-i+2) * 200))
		.text(d => d.key); 
	
	//Add axis
	SVG.append("g")
			.attr("class", "yAxis")
			.attr("transform", "translate(30,0)")
			.call(yAxisAbs); 
	
	d3.select(".yAxis").select(".domain").remove(); 
	
	transitionOrg = function() {
				let temp = SVG.selectAll("path")
					.data(stackB(totalWorksPerSeason))
					.transition().duration(1400)
					.attr("d", areaAbsolute)
					.attr("fill", (d) => {
						if (d.key == "first") return "Tomato";
						if (d.key == "repeat") return "Steelblue";
					});
	
					let text = SVG.selectAll("text")
						.data(stackB(totalWorksPerSeason)); 
		
				text.transition()
				.duration(1400)
				.text(d => d.key);
		
		SVG.select(".yAxis")
			.transition()
			.duration(1400)
			.call(yAxisAbs); 
		
			d3.select(".yAxis").select(".domain").remove(); 

	}
	
	
	transition = function() {
		let stackData = stackA(percentagesFirstRepeat); 
		let newStuff = SVG.selectAll("path")
			//.data(stack(percentagesLivingDead)); 
		.data(stackData); 
				//.data(stackA(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7))); 
		
		console.log(stackData); 
		let text = SVG.selectAll("text")
			.data(stackA(percentagesFirstRepeat)); 
				//.data(stackA(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7))); 

		//newStuff.exit().remove()//.attr("d",areaInit)//.attr("fill", (d) => {
				//if (d.key == "pctFirstSingle") return "Steelblue";
				//if (d.key == "pctFirstMult") return "Tomato";
				//if (d.key == "pctRepeat") return "#59273e";
		//})
		newStuff.transition()
						.duration(1400)
						.attr("d", area)
						.attr("fill", (d) => {
							if (d.key == "percentageFirst") return "Tomato";
							if (d.key == "percentageRepeat") return "Steelblue";
						});

		text.transition()
				.duration(1400)
				.text(d => d.key);
				
		SVG.select(".yAxis")
			.transition()
			.duration(1400)
			.call(yAxisPct);
		
		d3.select(".yAxis").select(".domain").remove(); 

		
			//.attr("d", area)
		//.attr("fill", (d) => {
		//		if (d.key == "pctFirstSingle") return "Steelblue";
		//		if (d.key == "pctFirstMult") return "Tomato";
		//		if (d.key == "pctRepeat") return "Grey";
		//}); 

	}
	
	transition2 = function() {
		let newStuff = SVG.selectAll("path")
			//.data(stack(percentagesLivingDead)); 
		//.data(stackA(percentagesFirstRepeat)); 
				.data(stackA(movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 9)))
				//.data(stackA(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7))); 
			
		let text = SVG.selectAll("text")
			//.data(stackA(percentagesFirstRepeat)); 
				.data(stackA(movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 9)));

		//newStuff.exit().remove()//.attr("d",areaInit)//.attr("fill", (d) => {
				//if (d.key == "pctFirstSingle") return "Steelblue";
				//if (d.key == "pctFirstMult") return "Tomato";
				//if (d.key == "pctRepeat") return "#59273e";
		//})
		newStuff.transition()
						.duration(1400)
						.attr("d", area)
						.attr("fill", (d) => {
							if (d.key == "percentageFirst") return "Tomato";
							if (d.key == "percentageRepeat") return "Steelblue";
						});

		text.transition()
				.duration(1400)
				.text(d => d.key);
				

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
		if (target.id === "transition-next") transition2(); 
	}); 
	
}); 

//function movingAverageOfProps(array, keys) {
//	return array.map( (item, idx) => {
//		let beginIndex = idx-4 >= 0 ? idx-4 : 0, 
//				endIndex = idx+5, 
//				collection = array.slice(beginIndex, endIndex), 
//				collLength = collection.length, 
//				movingAvgs = {}; 
//		
//		keys.forEach(key => {
//			movingAvgs[key] = collection.reduce( (sum, val) => sum + val[key], 0)/collLength; 
//		})
//		
//		return Object.assign({season: item.season}, movingAvgs); 
//	}); 
//}

function movingAverageWithRange(array, keys, range) {
	let padding = Math.floor(range/2); 
	
	return array.map( (item, idx) => {
		let beginIndex = idx-padding >= 0 ? idx-padding : 0, 
				endIndex = idx + padding + 1, 
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

