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


let composers = {};
let composersArray = []; 
const SVG_HEIGHT = 600;
const SVG_WIDTH = 1200;

let transition; 
let transition2; 

d3.json('complete_latest_july_2017.json', d => {
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
	
	//turn object into array 
	for (let composer in composers) {
		composersArray.push(Object.assign(composers[composer], {composer: composer})); 
	}
	
	console.log(composersArray); 
	console.log(JSON.stringify(composersArray)); 
	
	let compositionsAllSorted = compositionsBySeasonCount(); 
	
	
	let firstPerfsOfSeasons = {}; 
	let seasonsFirstTimeCompositions = []; 
	let seasonsNewCompRatios = []; 
	
	const seasonsByTotalPerfs = compositionsPerSeason(); 

	
	//STREAMGRAPH DATA

	//TAKE stringified JSON OBJECT AND ADD WORLD PREMIERE + US PREMIERE INFO and redo Streamgraphs
	//console.log(JSON.stringify(compositionsAllSorted));
	
	compositionsAllSorted.forEach(composition => {
		const FIRST_SEASON = composition.seasons[0];
		if (!firstPerfsOfSeasons[FIRST_SEASON]) {
			firstPerfsOfSeasons[FIRST_SEASON] = [composition]; 
		} else {
			firstPerfsOfSeasons[FIRST_SEASON].push(composition); 
		}
	}); 
	

	for (let season in firstPerfsOfSeasons) {
		seasonsFirstTimeCompositions.push({season: season, compositions: firstPerfsOfSeasons[season]});
	}
	
	let ratiosOfFirstTime = seasonsByTotalPerfs.map(season => {
		return {season: season.season, ratio: firstPerfsOfSeasons[season.season].length/season.count};
	}); 	

	let stats = ALL_SEASONS.map( (season, idx) => {
		
		return {season: season, 
						totalPieces: seasonsByTotalPerfs[idx].count, 
						piecesFirst: firstPerfsOfSeasons[season].length, 
						piecesRepeat: seasonsByTotalPerfs[idx].count - firstPerfsOfSeasons[season].length}; 
	}); 
	
	let statsVers2 = ALL_SEASONS.map( (season, idx) => {
		
		let firstWithRepeatPerfs = firstPerfsOfSeasons[season].filter( piece => {
			return piece.seasonCount > 1; 
		}).length; 
		
		return {season: season, 
						totalPieces: seasonsByTotalPerfs[idx].count, 
						piecesFirst: firstPerfsOfSeasons[season].length, 
						piecesFirstSingle: firstPerfsOfSeasons[season].length - firstWithRepeatPerfs, 
						piecesFirstMultiple: firstWithRepeatPerfs, 
						piecesRepeat: seasonsByTotalPerfs[idx].count - firstPerfsOfSeasons[season].length}; 
	}); 
	
	let statsPerc0 = statsVers2.map( (season) => {
		return {
			pctRepeat: season.piecesRepeat/season.totalPieces, 
			pctFirst: season.piecesFirst/season.totalPieces, 
			//pctFirstMult: season.piecesFirstMultiple/season.totalPieces
		}; 
	});
	
	let statsPerc1 = statsVers2.map( (season) => {
		return {
			pctRepeat: season.piecesRepeat/season.totalPieces, 
			pctFirstMult: season.piecesFirstMultiple/season.totalPieces,
			pctFirst: season.piecesFirstSingle/season.totalPieces, 
		}; 
	});
	
	console.log("STREAMGRAPH DATASET 1: With total pieces performed, first time pieces, repeat pieces:");
	console.log(stats);
	console.log("STREAMGRAPH DATASET 2: With deets of first-time pieces, including those that get at least one repeat perf\(s\):");
	console.log(statsVers2);

	const MAX_PIECES_PER_SEASON = seasonsByTotalPerfs.reduce((max, season) => { 
		return season.count > max ? season.count : max 
	}, 0); 
	
	const SVG = d3.select(".container")
								.append("svg")
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", SVG_WIDTH)
								.attr("height", SVG_HEIGHT)
								.attr("transform", "translate(0,30)");
	
	let stack0 = d3.stack()
								//.keys(["piecesFirstSingle", "piecesFirstMultiple", "piecesRepeat"])
								//.keys(["pctRepeat", "pctFirstSingle", "pctFirstMult"])
								.keys(["pctRepeat", "pctFirst"]); 
								//.offset(d3.stackOffsetWiggle); 	
	
	let stack1 = d3.stack().keys(["pctRepeat", "pctFirstMult", "pctFirst"]); 
						
	
	let x = d3.scaleLinear().domain([0,174]).range([0,SVG_WIDTH]); 
	let y = d3.scaleLinear().domain([0,1.05]).range([SVG_HEIGHT, 0]);
	
	//console.log(stack(statsPerc));
	let area = d3.area()
							.curve(d3.curveCardinal.tension(.1))
							.x((d, i) => x(i) )
							.y0(d => y( d[0]) )
							.y1(d => y( d[1]) ); 
	
	let areaInit = d3.area()
							.curve(d3.curveCardinal.tension(.1))
							.x((d, i) => x(i) )
							.y0(d => 28 )
							.y1(d => 28 ); 
							
	
	SVG.selectAll("path")
  .data(stack1(statsPerc1))
  .enter().append("path")
    .attr("d", area)
		.attr("fill", (d) => {
			if (d.key == "pctFirst") return "Tomato";
			if (d.key == "pctFirstMult") return "Steelblue";
			if (d.key == "pctRepeat") return "#59273e";
		});
		//.attr("stroke", "Black"); 

	transition2 = function() {
		let newStuff = SVG.selectAll("path")
			.data(stack1(statsPerc1)).enter().append("path").attr("d",areaInit).transition()
			.duration(1200).attr("d", area).attr("fill", (d) => {
				if (d.key == "pctFirst") return "Tomato";
				if (d.key == "pctFirstMult") return "Steelblue";
				if (d.key == "pctRepeat") return "#59273e";
			});
		
	}
	
	transition = function() {
		let newStuff = SVG.selectAll("path")
			.data(stack0(statsPerc0));
		
		newStuff.exit().remove()//.attr("d",areaInit)//.attr("fill", (d) => {
				//if (d.key == "pctFirstSingle") return "Steelblue";
				//if (d.key == "pctFirstMult") return "Tomato";
				//if (d.key == "pctRepeat") return "#59273e";
		//})
		newStuff.transition().duration(1000).attr("d", area).attr("fill", (d) => {
				if (d.key == "pctFirst") return "Steelblue";
				//if (d.key == "pctFirstMult") return "Tomato";
				if (d.key == "pctRepeat") return "#59273e";
		})//.attr("stroke", "Black");

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
		if (target.id === "transition-back") transition2(); 
	}); 


//End of d3.json()....function 
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

function compositionsBySeasonCount () {
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
