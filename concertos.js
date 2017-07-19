/*

Things to do: 

A) Create Github repo
B) Add Build tools and other stuff to project 
C) Think about how to split up code and start experimenting with chunks of the data
D) Sketch viz ideas 
E) Break utility code into a seperate folder, possibly to be reused in future data projects, esp obj prop access

Possible questions to ask: 

1) Histogram of frequency of pieces in seasons 
2) Tour map through time
3) Changes in trends and styles--arrangements more common back in the day? 
4) Composer hit vs miss charts (one-hit wonders? ) 
5) Conductor-Soloist
6) Challenges of making into the repertoire 
7) Composer diversity (new vs. old, other characteristics)
8) Orphaned composers (who get lots of repeat performances and then fall off map)
9) Geographic representation (Germans vs French vs. Americans (change over time) Streamgraph? Or even something else? Scrub through time? ) Need to collect composer nationalities
10) Percentage alive vs percentage dead (composers performed)--the rise and fall of Classical Music

(Metrics for these?)
11) used to be popular pieces that and no longer as popular
12) pieces that became more popular as time went on...
13) Music Directors leadership (changes in diversity of music? age of music? any real impact?)
14) Genres (Concertos, symphonies, tone poems etc.) x
15) Orchestral map showing most common concerto instruments (in pieces, in overall frequency)
16) Mean performances since founding of orchestra (for pieces composed before founding), and since composition, per piece. (Top 25? 50? Top 100?)
17) Season heat map (percentage of recent compositions; composed in the last 15? 30? years?) Is there a peak? I.E. Highest percentage of pieces composed in the past x years? Do differential: average age of pieces performed in any one year. 

Need to collect composer + composition Metadata
*/



let composers = {}; 
let instrumentalTypes = {}; 

const omittedTypes = ["Soprano", "Tenor", "Vocalist", "Mens Chorus", "Chorus", "Baritone", "Bass", "Contralto", "Mezzo-Soprano", "Boys Choir", "Alto", "Womens Chorus", "Solo Voice", "Narrator", "Female Speaker", "Male Speaker", "Dancer", "Bass-Baritone", "Countertenor", "Child Soprano", "Reader", "Male Voice", "Actress", "Executive Producer", "Director", "Producer", "Host", "Singer", "Band"]; 


d3.json('2011-12_TO_NOW.json', d => {
	const PROGRAMS = d.programs; 
	
	/*
	TODOS: 
	
	1) figure out whether to count each individual performance, or each 'program'; 
	Programs are sometimes 'dirty', that's if something like a solo instrumental is played by the soloist
	on one performance, the json data treats it as a seperate entity from the other concerns with 
	basically the same concert program. 
	
	2) Also, deal with multimovement works, in some seasons, works are broken up into seperate movements and this 
	causes some works to be counted multiple times. This is happening with works with lots of performances
	
	3) Might be interesting to write shorter functions and code to clean and merge some data chunks first. Find a best practices that's robust to all the variations in the data 
	*/

	
	const subscriptionConcerts = PROGRAMS.filter( p => {
		return p.orchestra === "New York Philharmonic"; 
	}).filter( p => {
		return p.concerts[0]["eventType"] === "Subscription Season"; 
	}); 
	
	console.log(subscriptionConcerts); 
	
	let allWorks = []; 
	
	subscriptionConcerts.forEach( program => {
		let works = [], 
				numOfConcerts = program.concerts.length;
		
		program.works.forEach( work => {
			let unid = work["ID"],
					composer = work["composerName"], 
					composition = work["workTitle"], 
					conductor = work["conductorName"], 
					soloists = work["soloists"], 
					season = program.season; 
			
			for (let i = 0; i < soloists.length; i++) {
				if (omittedTypes.includes(soloists[i].soloistInstrument)) {
					soloists = ""; 
					break; 
				}
			}
			
			
			//if (soloists.length && conductor) {
			//	soloists = soloists.map(solo => solo.soloistInstrument); 
			//	let key = soloists.length === 1 ? soloists[0] : soloists.sort().toString(); 
			//	console.log(key);
			//	if (!instrumentalTypes[key]) {
			//		instrumentalTypes[key] = [{piece: composition, composer: composer}]; 
			//		allWorks.push(unid); 
			//	} else {
			//		
			//		/*TODO: Fix bug. Only matches for exisiting composition name; duplicates of generic titles like 'Concerto, Clarinet' by different composers not being added 
			//		*/
			//		
			//		let index; 
			//		if (!allWorks.includes(unid)) {
			//				instrumentalTypes[key].push({piece: composition, composer: composer}); 
			//		}
			//	}
			//}
			
			//composer skips intermissions
			//conductor skips solo pieces performed by soloists
			//!works.includes(composition) checks to see if multi-movement work listed seperately and only records the
			//first instance
			if (composer && conductor && !works.includes(composition) && soloists.length !== 0) {
				//check if composer has already been added
				
				soloists = soloists.map(solo => solo.soloistInstrument); 
				let key = soloists.length === 1 ? soloists[0] : soloists.sort().toString(); 
				//console.log(key);
				if (!instrumentalTypes[key]) {
					instrumentalTypes[key] = [{piece: composition, composer: composer, season: [season]}]; 
					allWorks.push(unid); 
				} else {
					
					
					if (!allWorks.includes(unid)) {
						instrumentalTypes[key].push({piece: composition, composer: composer, season: [season]}); 
						allWorks.push(unid);
					} else {
						
						//FIX SEASONS PROBLEM 
						//Need to ask if there's already a recorded season, and if so, find the right work to push season into
						//if (!instrumentalTypes[key][instrumentalTypes[key].length-1]["season"].includes(season)) {
						//	
						//}
						
					}
				}
				
				
				
				if (composers[composer]) {
					//composition already added
					let index; 
					if (index = find(composers[composer]["works"], "title", composition), index != null) {
						composers[composer]["works"][index]["performanceCount"] += numOfConcerts; 
						
						!composers[composer]["works"][index].seasons.includes(program.season) 
							? composers[composer]["works"][index].seasons.push(program.season) 
							: void 0; 

					//otherwise...
					} else {
						composers[composer]["works"].push(
							{title: composition, performanceCount: numOfConcerts, seasons: [program.season]}
						);

					}
					
				} else {
					
					composers[composer] = {}; 
					composers[composer]["works"] = []; 
										
					composers[composer]["works"].push(
						{title: composition, performanceCount: numOfConcerts, seasons: [program.season]}
					); 
				

				}
				
				works.push(composition); 
			}
		}); 
	}); 
	
	console.log(composers); 
	console.log(compositionsByFrequency());
	console.log(compositionsBySeason());
	var compositionsSorted = compositionsBySeason(); 
	var totalCompositions = compositionsSorted.length; 
	var top100 = compositionsSorted.slice(0,100); 
	//top100.forEach(piece => console.log(`${piece.title} by: ${piece.composer}`));  
	console.log(Object.keys(composers).length)
	//console.log(instrumentalTypes); 
	
	
	let svg = d3.select('svg')//.attr("width", window.innerWidth).attr("height", window.innerHeight); 
	
	let margin = {top: 20, right: 20, bottom: 30, left: 50};
	let svgWidth = +svg.attr("width") - margin.left - margin.right;
	let svgHeight = +svg.attr("height") - margin.top - margin.bottom;
	let g = svg.append("g").attr("transform", `translate( ${margin.left}, ${margin.top} )`);
	
	let x = d3.scaleLinear()
						.domain([0,totalCompositions])
						.range([0,svgWidth]); 
	let y = d3.scaleLinear()
						.domain([compositionsSorted[0].seasons.length, 0])
						.range([0,svgHeight]); 
	
	let colorIndex = d3.scaleLinear()
						.domain([0,compositionsSorted[0].seasons.length])
						.range([0,1]); 
	
	
	console.log(svgHeight,svgWidth);
	g.append("g")
      .call(d3.axisRight(y).tickSize(svgWidth))
			//.attr("transform", "translate(" + svgWidth + ",0)")
			.append("text")
			.attr("fill", "#000")
			.attr("transform", "translate(-50,380),rotate(90)")
			//.attr("transform", "")
			.attr("y", 6)
			.attr("dy", "1.71em")
			.attr("text-anchor", "end")
			.attr("font-size", "12")
			.text("Number of Seasons Composition Appears In (Out of 4285 Compositions)")
			//
			//
			
	g.select('.domain')
		.remove(); 
	
	g.selectAll("line")
		.data(compositionsSorted.reverse())
		.enter()
		.append("line")
		.attr("x1", (d,i) => x(i))
		.attr("y1", svgHeight)
		.attr("x2", (d,i) => x(i))
		.attr("y2", d => y(d.seasons.length))
		//.stroke="black" stroke-width="20"
		.attr("stroke", d => d3.interpolateViridis(colorIndex(d.seasons.length)) )
		.attr("stroke-width", "3"); 
	
	
    
	
	
	
	
}); 

function find(objArr, searchProp, searchValue) {
	let found = null; 
	objArr.forEach((item, idx) => {
		if (item[searchProp] === searchValue) found = idx; 
	})
	return found; 
}



function compositionsByFrequency () {
	let compositions = []; 
	for (let composer in composers) {
		composers[composer].works.forEach( work => {
			compositions.push(Object.assign(work, {composer: composer})); 
		});
	}
	
	return compositions.sort( (a,b) => {
		return b.performanceCount - a.performanceCount; 
	}); 
}

function compositionsBySeason () {
	let compositions = []; 
	for (let composer in composers) {
		composers[composer].works.forEach( work => {
			compositions.push(Object.assign(work, {composer: composer})); 
		});
	}
	
	return compositions.sort( (a,b) => {
		return b.seasons.length - a.seasons.length; 
	}); 
}



//Object.prototype.findValue = function(value, property) {
//	if (arguments.length == 1) {
//		
//	}
//}
