let composers = []; 

d3.json('compositions.json', (d) => {
	d.forEach(composer => {

		let composer_name = composer.composer.split(",").reverse().join(" "); 
		
		//TODO Need to do query and grab titles first using search API, THEN, do a query based on Title
		
		
		$.ajax({
  		url: '//en.wikipedia.org/w/api.php',
  		data: { action: 'query', titles: composer_name, format: 'json', prop: "categories" },
  		dataType: 'jsonp',
  		success: function (data) {
  		  let id = Object.keys(data.query.pages)[0]; 
				console.log(data.query.pages[id]);
  		}
		});
		
		
		
	}); 
}); 

