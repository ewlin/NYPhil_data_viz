Array.prototype.includesPattern = function (searchPattern, fromIndex) {
	for (let i=0; i<this.length; i++) {
		if (String(this[i]).match(searchPattern)) {
			return true; 
		}
	}
	
	return false; 
}

function includesPattern (obj, searchValue) {
	
}