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

//function movingAverageWithRange(array, keys, range) {
//	let padding = Math.floor(range/2); 
//	
//	return array.map( (item, idx) => {
//		let beginIndex = idx-padding >= 0 ? idx-padding : 0, 
//				endIndex = idx + padding + 1, 
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
    //number of values on each side of the central value
    let lastIndex = array.length - 1,
        padding = Math.floor(range / 2),
        maxIndex = lastIndex - padding;


	return array.map( (item, idx) => {

    if (idx < padding || idx > maxIndex) return item;

		let beginIndex = idx - padding >= 0 ? idx - padding : 0,
				endIndex = idx + padding + 1,
				collection = array.slice(beginIndex, endIndex),
				//collLength = collection.length,
				movingAvgs = {};

    if (!keys) {
    	return collection.reduce( (sum, val) => sum + val, 0) / range;
    }

		keys.forEach(key => {
            movingAvgs[key] = collection.reduce( (sum, val) => sum + val[key], 0) / range;
		})

    //TODO: Generalized this
    return Object.assign({season: item.season}, movingAvgs);
		//return Object.assign(movingAvgs, omit(item, keys));
	});
}

//
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