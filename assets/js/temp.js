//Check concerts outside of Subscription Series
function composersByFrequency (composers) {
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

d3.json('../../../data/complete_latest_july_2017.json', d => {
	const PROGRAMS = d.programs;

	let eventTypes = []; 
	
	let typesToCollect = ["NY Phil Biennial", "Horizons", "Contact!", "Rug Concerts", "Hear & Now"]; 
	let programsToCheck = []; 
	
	let composersMap = {}; 
	let composers = {}; 
	
	let concertCategories = PROGRAMS.filter( p => {
		return p.orchestra === "New York Philharmonic" //|| p.orchestra === "New York Symphony";
	}).forEach( p => {
		let type = p.concerts[0]["eventType"]; 
		if (!eventTypes.includes(type)) eventTypes.push(type); 
		
		if (typesToCollect.includes(type)) programsToCheck.push(p); 
	}); 
	
	
	console.log(programsToCheck); 
	
	//programsToCheck.forEach(program => {
	//	let season = program.season; 
	//	let works = program.works; 
	//	
	//	works.forEach(work => {
	//		if (!Object.values(composersMap).includes(work.composerName)) {
	//			composersMap[composers.length] = work.composerName; 
	//			composers.push({composer: work.composerName, works: []})
	//		}
	//		let composerIndex = Object.values(composersMap).indexOf(work.composerName); 
	//		
	//		composers[composerIndex].works.push({title: work.workTitle, season: season}); 
	//		
	//	}); 
	//	
	//}); 
	
	programsToCheck.forEach( program => {
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
					//if (index = composers[composer]["works"].findIndex( work => work.title == composition) {
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
	console.log(composersByFrequency(composers)); 

}); 


/*
	{
    "works": [
      {
        "title": "OTHELLO: SYMPHONIC PROLOGUE",
        "performanceCount": 4,
        "seasonCount": 3,
        "seasons": [
          "1885-86",
          "1887-88",
          "1893-94"
        ]
      }
    ],
    "composer": "Krug,  Arnold",
    "birth": "1849",
    "death": "1904"
  },
*/


function find(objArr, searchProp, searchValue) {
  if (!Array.isArray(objArr)) {
    throw new Error('first argument must be an array')
  } 
  if (arguments.length < 3) {
    throw new Error('must provide a key and value to search for')
  }
  var found = null;
  var length = objArr.length; 
  for (var i = 0; i < length; i++) {
    var item = objArr[i]; 
  	if (typeof item === 'object') {
  		if (item[searchProp] === searchValue) {
  			found = i; 
  			break; 
  		} 
  	}
  }
  return found;
}