d3.json('../../../data/complete_latest_july_2017.json', d => {
	const PROGRAMS = d.programs;

	let eventTypes = []; 
	
	let concertCategories = PROGRAMS.filter( p => {
		return p.orchestra === "New York Philharmonic" //|| p.orchestra === "New York Symphony";
	}).forEach( p => {
		let type = p.concerts[0]["eventType"]; 
		if (!eventTypes.includes(type)) eventTypes.push(type); 
		
		if (type === "Hear & Now") console.log(p); 
	}); 
	
	console.log(eventTypes); 
}); 
		
	