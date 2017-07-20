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
let svgHeight = 500;
let svgWidth = 1200;


d3.json('complete.json', d => {
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


	let subscriptionConcerts = PROGRAMS.filter( p => {
		return p.orchestra === "New York Philharmonic";
	}).filter( p => {
		return p.concerts[0]["eventType"] === "Subscription Season";
	});

	subscriptionConcerts.forEach( program => {
		let works = [],
				numOfConcerts = program.concerts.length;

		program.works.forEach( work => {
			let composer = work["composerName"],
					composition = work["workTitle"],
					conductor = work["conductorName"];

			//composer skips intermissions
			//conductor skips solo pieces performed by soloists
			//!works.includes(composition) checks to see if multi-movement work listed seperately and only records the
			//first instance
			if (composer && conductor && !works.includes(composition)) {
				//check if composer has already been added
				if (composers[composer]) {
					//composition already added
					let index;
					if (index = find(composers[composer]["works"], "title", composition), index != null) {
						composers[composer]["works"][index]["performanceCount"] += numOfConcerts;

						!composers[composer]["works"][index].seasons.includes(program.season)
							? (composers[composer]["works"][index].seasons.push(program.season), composers[composer]["works"][index]["seasonCount"] += 1)
							: void 0;

					//otherwise...
					} else {
						composers[composer]["works"].push(
							{title: composition, performanceCount: numOfConcerts, seasonCount: 1, seasons: [program.season]}
						);

					}

				} else {

					composers[composer] = {};
					composers[composer]["works"] = [];

					composers[composer]["works"].push(
						{title: composition, performanceCount: numOfConcerts, seasonCount: 1, seasons: [program.season]}
					);

				}

				works.push(composition);
			}
		});
	});

	console.log(composers);
	//console.log(compositionsByFrequency())
	console.log(compositionsBySeason());
	var compositionsSorted = compositionsBySeason();
	var totalCompositions = compositionsSorted.length;
	var top100 = compositionsSorted.slice(0,100);
	//console.log(top100);
	//console.log(Object.keys(composers).length)
	console.log(composersByFrequency());
	console.log(composersByUniqueWorks());

	//let svg = d3.select('svg')//.attr("width", window.innerWidth).attr("height", window.innerHeight);
	//
	//let margin = {top: 20, right: 20, bottom: 30, left: 50};
	//let svgWidth = +svg.attr("width") - margin.left - margin.right;
	//let svgHeight = +svg.attr("height") - margin.top - margin.bottom;
	//let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
	//g.append("g")
  //    .call(d3.axisRight(y))
	//		.attr("transform", "translate(" + svgWidth + ",0)")
	//		.append("text")
	//		.attr("fill", "#000")
	//		.attr("transform", "translate(-50,380),rotate(90)")
	//		//.attr("transform", "")
	//		.attr("y", 6)
	//		.attr("dy", "1.71em")
	//		.attr("text-anchor", "end")
	//		.attr("font-size", "12")
	//		.text("Number of Seasons Composition Appears In (Out of 4285 Compositions)")
	//		//
	//		//
	//
	//g.select('.domain')
	//	.remove();
	//
	//g.selectAll("line")
	//	.data(compositionsSorted.reverse())
	//	.enter()
	//	.append("line")
	//	.attr("x1", (d,i) => x(i))
	//	.attr("y1", svgHeight)
	//	.attr("x2", (d,i) => x(i))
	//	.attr("y2", d => y(d.seasons.length))
	//	//.stroke="black" stroke-width="20"
	//	.attr("stroke", d => d3.interpolateViridis(colorIndex(d.seasons.length)) )
	//	.attr("stroke-width", "1");

	let packScale = d3.scalePow()
										.exponent(.5)
										.range([0, svgHeight])
										.domain([0, 1281]);

	//let selectComposers = ["Beethoven,  Ludwig  van", "Mozart,  Wolfgang  Amadeus", "Brahms,  Johannes", "Berlioz,  Hector", "Strauss,  Richard", "Ravel,  Maurice", "Stravinsky,  Igor", "Bruch,  Max", "Haydn,  Franz  Joseph", "Berg,  Alban", "Debussy,  Claude", "Lindberg,  Magnus", "Rouse,  Christopher", "Bernstein,  Leonard", "Copland,  Aaron", "Bartok [Bartók],  Béla"];

  let composersByTopSeasons = processComposers(composers).sort((a,b) =>  b.works.reduce((sum,work)=>sum + (+work.seasonCount),0) - a.works.reduce((sum,work)=>sum + (+work.seasonCount),0)).slice(0,50); 
	
	console.log(composersByTopSeasons);
	
	composersByTopSeasons.forEach(composer => {
		let node = d3.hierarchy(composer, d => d.works).sum( d => d.seasonCount );
		let pack = d3.pack().size([packScale(node.value), packScale(node.value)]);
		let composerBubbles = d3.select("body")
			.append("svg")
			.attr("class", "composer")
			.attr("width", packScale(node.value))
			.attr("height", packScale(node.value) + 30)
			
			.selectAll(".work")
			.data((pack(node)).descendants())
			.enter()
			.append("circle")
			.attr("class", function(d) { return d.children ? "node parent" : "leaf node"; })
			.attr("r", function(d) { return d.r; })
			.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	}); 
	
	//selectComposers.forEach(composer => {
	//	console.log(composers[composer]);
	//	let node = d3.hierarchy(composers[composer], d => d.works).sum( d => d.seasonCount );
	//	let pack = d3.pack().size([packScale(node.value), packScale(node.value)]);
//
	//	d3.select("body")
	//		.append("svg")
	//		.attr("width", packScale(node.value))
	//		.attr("height", packScale(node.value))
	//		.selectAll(".work")
	//		.data((pack(node)).descendants())
	//		.enter()
	//		.append("circle")
	//		.attr("class", function(d) { return d.children ? "node parent" : "leaf node"; })
	//		.attr("r", function(d) { return d.r; })
	//		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });;
//
	//});

	//let node = d3.hierarchy(composers["Beethoven,  Ludwig  van"], d => d.works).sum( d => d.seasonCount );
	//console.log(packScale(1000));
	//let pack = d3.pack().size([packScale(node.value), packScale(node.value)]);
	//
	//g.append("g").selectAll(".work").data((pack(node)).descendants())
	//	.enter()
	//	.append("circle")
	//	.attr("class", function(d) { return d.children ? "node" : "leaf node"; })
	//	.attr("r", function(d) { return d.r; })
	//	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });;



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

function composersByFrequency () {
	let comps = [];
	for (let composer in composers) {
		let count = composers[composer].works.reduce( (count, work) => {
			return count + work.seasons.length;
		}, 0);

		comps.push({composer: composer, total: count, workTotal: composers[composer].works.length});
	}

	return comps.sort( (a,b) => {
		return b.total - a.total;
	});

}

function composersByUniqueWorks () {
	let comps = [];
	for (let composer in composers) {
		let count = composers[composer].works.reduce( (count, work) => {
			return count + work.seasons.length;
		}, 0);

		comps.push({composer: composer, total: count, workTotal: composers[composer].works.length});
	}

	return comps.sort( (a,b) => {
		return b.workTotal - a.workTotal;
	});
}


//push composers into an array
function processComposers (composers) {
    let arrOfComposers = [];
    for (let composer in composers) {
			arrOfComposers.push(Object.assign(composers[composer],{composer: composer}));
    }
    return arrOfComposers;
}


//Object.prototype.findValue = function(value, property) {
//	if (arguments.length == 1) {
//
//	}
//}
