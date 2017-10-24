module.exports = movingAverage;

/*
  Examples:

*/
//let omit = require('just-omit');

function movingAverage(array, keys, range) {
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

    if (!keys || keys.length === 0) {
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

