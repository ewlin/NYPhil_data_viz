const NY_PHIL_MUSIC_DIRECTORS_INFO = "music_directors.htm"; 

let conductors = []; 

d3.html(NY_PHIL_MUSIC_DIRECTORS_INFO, (error,data) => {
	console.log(data);
	let directors = data.querySelectorAll(".sectH"); 
	directors.forEach(conductor => {
		let matchTenure = /[0-9]+/g;
		let conductorInfo = String(conductor.innerHTML).replace(/\"/g,"\'"); 
		let name = conductorInfo.match(/[A-Za-z]+\s[A-Za-z]+/);
		let tenure = conductorInfo.match(matchTenure); 
		conductors.push({name: name[0], tenure: tenure});
	});
	
	console.log(conductors);
}); 
