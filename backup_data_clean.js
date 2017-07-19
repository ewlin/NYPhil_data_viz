let composers = {}; 

d3.json('complete.json', d => {
	const PROGRAMS = d.programs; 
	
	//TODO: figure out whether to count each individual performance, or each 'program'; 
	//Programs are sometimes 'dirty', that's if something like a solo instrumental is played by the soloist
	//on one performance, the json data treats it as a seperate entity from the other concerns with 
	//basically the same concert program. 
	
	//TODO: Also, deal with multimovement works 
	
	let subscriptionConcerts = PROGRAMS.filter( p => {
		return p.orchestra === "New York Philharmonic"; 
	}).filter( p => {
		return p.concerts[0]["eventType"] === "Subscription Season"; 
	}); 
	
	subscriptionConcerts.forEach( program => {
		program.works.forEach( work => {
			let composer = work["composerName"], 
					composition = work["workTitle"], 
					conductor = work["conductorName"]; 
			
			
			if (composer && conductor) {
				if (composers[composer]) {
					//composition already added
					let index; 
					if (index = find(composers[composer]["works"], "title", composition), index != null) {
						composers[composer]["works"][index]["performanceCount"] += 1; 

					//otherwise...
					} else {
					composers[composer]["works"].push({title: composition, performanceCount: 1}); 

					}
				} else {
					
					composers[composer] = {}; 
					composers[composer]["works"] = []; 
					composers[composer]["works"].push({title: composition, performanceCount: 1}); 
					
				}
				

			}
		}); 
	}); 
	
	console.log(composers); 
	console.log(Object.keys(composers)); 
	console.log(compositions());
	
}); 

function find(objArr, searchProp, searchValue) {
	let found = null; 
	objArr.forEach((item, idx) => {
		if (item[searchProp] === searchValue) found = idx; 
	})
	return found; 
}

function compositions () {
	let compositions = []; 
	for (var composer in composers) {
		composers[composer].works.forEach( work => {
			compositions.push(Object.assign(work, {composer: composer})); 
		});
	}
	
	return compositions.sort( (a,b) => {
		return b.performanceCount - a.performanceCount; 
	}); 
}




//Object.prototype.findValue = function(value, property) {
//	if (arguments.length == 1) {
//		
//	}
//}
