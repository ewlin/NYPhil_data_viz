//d3.json('compositions.json', (d) => {
//	d.forEach(composer => {
//		//console.log(composer.composer);
//		let composer_name = composer.composer.split(",").reverse().join(); 
//		$.ajax({
//  		url: '//en.wikipedia.org/w/api.php',
//  		data: { action: 'query', search: composer_name, format: 'json' },
//  		dataType: 'jsonp',
//  		success: function (x) {
//  		  console.log(x);
//  		}
//		});
//	}); 
//}); 

//$.ajax({
//  url: "https://en.wikipedia.org/wiki/Giovanni_da_Palestrina",
//  dataType: 'jsonp',
//  success: function (x) {
//    console.log(x);
//  }
//});

$.ajax({
  url: '//en.wikipedia.org/w/api.php',
  data: { action: 'query', titles: "Timo Andres", format: 'json', prop: "extracts" },
  dataType: 'jsonp',
  success: function (x) {
    console.log(x);
  }
});