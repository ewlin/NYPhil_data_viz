const ALL_SEASONS = [  
   "1842-43",
   "1843-44",
	 "1844-45",
   "1845-46",
   "1846-47",
   "1847-48",
   "1848-49",
   "1849-50",
   "1850-51",
   "1851-52",
   "1852-53",
   "1853-54",
   "1854-55",
   "1855-56",
   "1856-57",
   "1857-58",
   "1858-59",
   "1859-60",
   "1860-61",
   "1861-62",
   "1862-63",
   "1863-64",
   "1864-65",
   "1865-66",
   "1866-67",
   "1867-68",
   "1868-69",
   "1869-70",
   "1870-71",
   "1871-72",
   "1872-73",
   "1873-74",
   "1874-75",
   "1875-76",
   "1876-77",
   "1877-78",
   "1878-79",
   "1879-80",
   "1880-81",
   "1881-82",
   "1882-83",
   "1883-84",
   "1884-85",
   "1885-86",
   "1886-87",
   "1887-88",
   "1888-89",
   "1889-90",
   "1890-91",
   "1891-92",
   "1892-93",
   "1893-94",
   "1894-95",
   "1895-96",
   "1896-97",
   "1897-98",
   "1898-99",
   "1899-00",
   "1900-01",
   "1901-02",
   "1902-03",
   "1903-04",
   "1904-05",
   "1905-06",
   "1906-07",
   "1907-08",
   "1908-09",
   "1909-10",
   "1910-11",
   "1911-12",
   "1912-13",
   "1913-14",
   "1914-15",
   "1915-16",
   "1916-17",
   "1917-18",
   "1918-19",
   "1919-20",
   "1920-21",
   "1921-22",
   "1922-23",
   "1923-24",
   "1924-25",
   "1925-26",
   "1926-27",
   "1927-28",
   "1928-29",
   "1929-30",
   "1930-31",
   "1931-32",
   "1932-33",
   "1933-34",
   "1934-35",
   "1935-36",
   "1936-37",
   "1937-38",
   "1938-39",
   "1939-40",
	 "1940-41",
   "1941-42",
   "1942-43",
   "1943-44",
   "1944-45",
   "1945-46",
   "1946-47",
   "1947-48",
   "1948-49",
   "1949-50",
   "1950-51",
   "1951-52",
   "1952-53",
   "1953-54",
   "1954-55",
   "1955-56",
   "1956-57",
   "1957-58",
   "1958-59",
   "1959-60",
   "1960-61",
   "1961-62",
   "1962-63",
   "1963-64",
   "1964-65",
   "1965-66",
   "1966-67",
   "1967-68",
   "1968-69",
   "1969-70",
   "1970-71",
   "1971-72",
   "1972-73",
   "1973-74",
   "1974-75",
   "1975-76",
   "1976-77",
	 "1977-78",
   "1978-79",
   "1979-80",
   "1980-81",
   "1981-82",
   "1982-83",
   "1983-84",
   "1984-85",
   "1985-86",
   "1986-87",
   "1987-88",
   "1988-89",
   "1989-90",
   "1990-91",
   "1991-92",
   "1992-93",
   "1993-94",
   "1994-95",
   "1995-96",
   "1996-97",
	 "1997-98",
   "1998-99",
	 "1999-00",
   "2000-01",
   "2001-02",
   "2002-03",
   "2003-04",
   "2004-05",
   "2005-06",
   "2006-07",
   "2007-08",
   "2008-09",
   "2009-10",
   "2010-11",
   "2011-12",
   "2012-13",
   "2013-14",
   "2014-15",
   "2015-16",
   "2016-17"
]; 

/*

Things to do:

+ A) Create Github repo
B) Add Build tools and other stuff to project
C) Think about how to split up code and start experimenting with chunks of the data
D) Sketch viz ideas
E) Break utility code into a seperate folder, possibly to be reused in future data projects, esp obj prop access

Possible questions to ask:

X 1) Histogram of frequency of pieces in seasons
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
14) Genres (Concertos, symphonies, tone poems etc.) 
15) Orchestral map showing most common concerto instruments (in pieces, in overall frequency)
16) Mean performances since founding of orchestra (for pieces composed before founding), and since composition, per piece. (Top 25? 50? Top 100?)
17) Season heat map (percentage of recent compositions; composed in the last 15? 30? years?) Is there a peak? I.E. Highest percentage of pieces composed in the past x years? Do differential: average age of pieces performed in any one year.

Need to collect composer + composition Metadata
*/



let composers = {};
let svgHeight = 500;
let svgWidth = 1200;


d3.json('../../data/complete_latest_july_2017.json', d => {
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
		return p.orchestra === "New York Philharmonic" //|| p.orchestra === "New York Symphony";
	}).filter( p => {
		return p.concerts[0]["eventType"] == "Subscription Season";
	});

	console.log(subscriptionConcerts); 
	subscriptionConcerts.forEach( program => {
		let works = [],
				numOfConcerts = program.concerts.length, 
				seas = program.season;

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
						
						//console.log(composers[composer]["works"][index].seasons); 
						!Object.keys(composers[composer]["works"][index].seasons).includes(program.season)
							? (composers[composer]["works"][index].seasons[program.season] = numOfConcerts, composers[composer]["works"][index]["seasonCount"] += 1)
							: composers[composer]["works"][index].seasons[seas] += numOfConcerts;

					//otherwise...
					} else {
						let workObj = {title: composition, performanceCount: numOfConcerts, seasonCount: 1, seasons: {}}; 
						
						workObj.seasons[program.season] = numOfConcerts; 

						composers[composer]["works"].push(workObj);

					}

				} else {
					let workObj = {title: composition, performanceCount: numOfConcerts, seasonCount: 1, seasons: {}}; 
					
					workObj.seasons[program.season] = numOfConcerts; 
					
					composers[composer] = {};
					composers[composer]["works"] = [];

					composers[composer]["works"].push(workObj);

				}

				works.push(composition);
			}
		});
	});

	//let compositionsAllSorted = compositionsBySeason(); 
	//
	//let firstPerfsOfSeasons = {}; 
	//let seasonsFirstTimeCompositions = []; 
	//let seasonsNewCompRatios = []; 
	//
	//const seasonsByTotalPerfs = compositionsPerSeason(); 
//
	//compositionsAllSorted.forEach(composition => {
	//	const FIRST_SEASON = composition.seasons[0];
	//	if (!firstPerfsOfSeasons[FIRST_SEASON]) {
	//		firstPerfsOfSeasons[FIRST_SEASON] = [composition]; 
	//	} else {
	//		firstPerfsOfSeasons[FIRST_SEASON].push(composition); 
	//	}
	//}); 
//
	//for (let season in firstPerfsOfSeasons) {
	//	seasonsFirstTimeCompositions.push({season: season, compositions: firstPerfsOfSeasons[season]});
	//}
	//
	//console.log(firstPerfsOfSeasons);
	//let ratiosOfFirstTime = seasonsByTotalPerfs.map(season => {
	//	return {season: season.season, ratio: firstPerfsOfSeasons[season.season].length/season.count};
	//}); 
	////console.log(seasonsByTotalPerfs); 
	////console.log(ratiosOfFirstTime);
	//
//
	//let stats = ALL_SEASONS.map( (season, idx) => {
	//	
	//	return {season: season, 
	//					totalPieces: seasonsByTotalPerfs[idx].count, 
	//					piecesFirst: firstPerfsOfSeasons[season].length, 
	//					piecesRepeat: seasonsByTotalPerfs[idx].count - firstPerfsOfSeasons[season].length}; 
	//}); 
	//
	//let statsVers2 = ALL_SEASONS.map( (season, idx) => {
	//	
	//	let firstWithRepeatPerfs = firstPerfsOfSeasons[season].filter( piece => {
	//		return piece.seasonCount > 1; 
	//	}).length; 
	//	
	//	return {season: season, 
	//					totalPieces: seasonsByTotalPerfs[idx].count, 
	//					piecesFirst: firstPerfsOfSeasons[season].length, 
	//					piecesFirstSingle: firstPerfsOfSeasons[season].length - firstWithRepeatPerfs, 
	//					piecesFirstMultiple: firstWithRepeatPerfs, 
	//					piecesRepeat: seasonsByTotalPerfs[idx].count - firstPerfsOfSeasons[season].length}; 
	//}); 
	//
	//
	//
	//console.log(stats);
	//console.log(statsVers2);
	//console.log(compositionsAllSorted);
	//var compositionsSorted = compositionsBySeason();
	//var totalCompositions = compositionsSorted.length;
	//var top100 = compositionsSorted.slice(0,100);
	////console.log(top100);
	////console.log(Object.keys(composers).length)
	//console.log(composersByFrequency());
	//console.log(composersByUniqueWorks());
//
	////let svg = d3.select('svg')//.attr("width", window.innerWidth).attr("height", window.innerHeight);
	////
	////let margin = {top: 20, right: 20, bottom: 30, left: 50};
	////let svgWidth = +svg.attr("width") - margin.left - margin.right;
	////let svgHeight = +svg.attr("height") - margin.top - margin.bottom;
	////let g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
//
	//let x = d3.scaleLinear()
	//					.domain([0,totalCompositions])
	//					.range([0,svgWidth]);
	//let y = d3.scaleLinear()
	//					.domain([compositionsSorted[0].seasons.length, 0])
	//					.range([0,svgHeight]);
//
	//let colorIndex = d3.scaleLinear()
	//					.domain([0,compositionsSorted[0].seasons.length])
	//					.range([0,1]);
//
//
	//console.log(svgHeight,svgWidth);
	////g.append("g")
  ////    .call(d3.axisRight(y))
	////		.attr("transform", "translate(" + svgWidth + ",0)")
	////		.append("text")
	////		.attr("fill", "#000")
	////		.attr("transform", "translate(-50,380),rotate(90)")
	////		//.attr("transform", "")
	////		.attr("y", 6)
	////		.attr("dy", "1.71em")
	////		.attr("text-anchor", "end")
	////		.attr("font-size", "12")
	////		.text("Number of Seasons Composition Appears In (Out of 4285 Compositions)")
	////		//
	////		//
	////
	////g.select('.domain')
	////	.remove();
	////
	////g.selectAll("line")
	////	.data(compositionsSorted.reverse())
	////	.enter()
	////	.append("line")
	////	.attr("x1", (d,i) => x(i))
	////	.attr("y1", svgHeight)
	////	.attr("x2", (d,i) => x(i))
	////	.attr("y2", d => y(d.seasons.length))
	////	//.stroke="black" stroke-width="20"
	////	.attr("stroke", d => d3.interpolateViridis(colorIndex(d.seasons.length)) )
	////	.attr("stroke-width", "1");
//
	//let packScale = d3.scalePow()
	//									.exponent(.5)
	//									.range([0, svgHeight])
	//									.domain([0, 1281]);
//
//
  //let composersByTopSeasons = processComposers(composers).sort((a,b) =>  b.works.reduce((sum,work)=>sum + (+work.seasonCount),0) - a.works.reduce((sum,work)=>sum + (+work.seasonCount),0)).slice(0,60); 
	//
	//console.log(composersByTopSeasons);
	//
	//composersByTopSeasons.forEach(composer => {
	//	let node = d3.hierarchy(composer, d => d.works).sum( d => d.seasonCount );
	//	let pack = d3.pack().size([packScale(node.value), packScale(node.value)]);
	//	let formattedComposerName = `${composer.composer.split(",")[0]}`; 
	//	let composerBubbles = d3.select("body")
	//		.append("svg")
	//		.attr("class", "composer")
	//		.attr("width", packScale(node.value))
	//		.attr("height", packScale(node.value) + 30); 
	//	
	//	console.log(formattedComposerName); 
	//	
	//	composerBubbles
	//		.append("g")
	//		//.attr("transform", "translate(0,20)")
	//		.selectAll(".work")
	//		.data((pack(node)).descendants())
	//		.enter()
	//		.append("circle")
	//		.attr("class", function(d) { return d.children ? "node parent" : "leaf node"; })
	//		.attr("r", function(d) { return d.r; })
	//		.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
	//	
	//	composerBubbles.append("text")
	//									.attr("fill", "Black")
	//									.attr("font-size", "15px")
	//									.attr("transform", "translate(20,30)")
	//									.attr("font-family", "Arial")
	//									.text(formattedComposerName.toUpperCase());
	//}); 
	
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



d3.json('../../data/new_top60.json', composers => {
  let before1881 = []; 
  let before1900 = []; 
  let _1900AndAfter = []; 

  composers.forEach( composer => {
    let comp = {composer: composer.composer, birth: composer.birth}; 
    if (composer.birth < 1881 && composer.birth >= 1842) before1881.push(comp); 
    if (composer.birth < 1900 && composer.birth >= 1881) before1900.push(comp); 
    if (composer.birth >= 1900) _1900AndAfter.push(comp); 
  }); 
  
  console.log(before1881); 
  console.log(before1900);
  console.log(_1900AndAfter);
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
			return count + work.seasonCount;
		}, 0);
    console.log(count); 

		comps.push({composer: composer, total: count, workTotal: composers[composer].works.length});
	}

	return comps.sort( (a,b) => {
		return b.total - a.total;
	});

}

console.log(composersByFrequency()); 


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

function compositionsPerSeason () {
	let compositions = [];
	for (let composer in composers) {
		composers[composer].works.forEach( work => {
			compositions.push(Object.assign(work, {composer: composer}));
		});
	}

	return ALL_SEASONS.map( season => {
		let count = compositions.reduce( (sum, composition) => {
			return composition.seasons.includes(season) ? ++sum : sum; 
		}, 0); 
		
		return {season: season, count: count}; 
	})
	//return compositions.sort( (a,b) => {
	//	return b.seasons.length - a.seasons.length;
	//});
}

//push composers into an array
function processComposers (composers) {
    let arrOfComposers = [];
    for (let composer in composers) {
			if (composer !== "Traditional,") {
					arrOfComposers.push(Object.assign(composers[composer],{composer: composer}));
			}
    }
    return arrOfComposers;
}


//Object.prototype.findValue = function(value, property) {
//	if (arguments.length == 1) {
//
//	}
//}
