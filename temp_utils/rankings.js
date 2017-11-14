//Examples:
//let arrObjs = [{a: 'a', b: 9}, {a: 'b', b: 9}, {a: 'c', b: 8}, {a: 'd', b: 7}, {a: 'e', b: 7}, {a: 'f', b: 2}]

//ranking(arrObjs, (item) => item.b);
//returns: 
//[{a: "a", b: 9, rank: 1}
//{a: "b", b: 9, rank: 1}
//{a: "c", b: 8, rank: 3}
//{a: "d", b: 7, rank: 4}
//{a: "e", b: 7, rank: 4}
//{a: "f", b: 2, rank: 6}]

//add functionality to function so that it can deal with array of objects

function ranking(array, accessor) {
    let currentRank = 1,
        currentValue = accessor.call(null, array[0]),
        withSameValue = 0,
        itemType =  Array.isArray(array[0]) ? 'array' : typeof array[0] == 'object' ? 'object' : null;

    return array.map(item => {
        let itemValue = accessor.call(null, item); //again, use acessor function to grab this

        if (itemValue !== currentValue) {
            currentRank += withSameValue;
            currentValue = itemValue;
            withSameValue = 1;
        } else {
            withSameValue++;
        }

        if (itemType == 'array') {
            return item.concat(currentRank);
        } else if (itemType == 'object') {
            return Object.assign(item, {rank: currentRank});
        } else {
            return null;
        }
    });
}

module.exports = ranking; 
