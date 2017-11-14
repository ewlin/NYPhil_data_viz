'use strict';

var composers = [];
d3.json('../../data/compositions.json', function (d) {
	console.log(d);
	d.forEach(function (composer) {
		var composer_name = composer.composer.split(',').reverse().join(' ').trim();

		var composer_object = Object.assign(composer, {
			birth: null,
			death: null
		});

		$.ajax({
			url: '//en.wikipedia.org/w/api.php',
			data: { action: 'query', titles: composer_name, format: 'json', prop: 'categories' },
			dataType: 'jsonp',
			success: function success(data) {
				var id = Object.keys(data.query.pages)[0];
				var categories = data.query.pages[id].categories;
				var death = void 0,
				    birth = void 0;

				var dataObject = data.query.pages[id];
				//console.log(dataObject); 


				for (var i = 0; i < (categories ? categories.length : 0); i++) {
					if (death = categories[i].title.match(/[0-9]+\sdeaths/)) {
						death = death[0].split(" ")[0];
						composer_object["death"] = death;
					} else if (birth = categories[i].title.match(/[0-9]+\sbirths/)) {
						birth = birth[0].split(" ")[0];
						composer_object["birth"] = birth;
					}
				}
			},
			complete: function complete() {
				//Write a conditional to check if there's at least a birth year. If so, push into array, if not try an ajax call again with querying for a list of results and taking the first

				if (composer_object["birth"]) {
					composers.push(composer_object);
				} else {

					var search = void 0;

					$.ajax({
						url: '//en.wikipedia.org/w/api.php',
						data: { action: 'query', list: 'search', srsearch: composer_name, format: 'json' },
						dataType: 'jsonp',
						success: function success(data) {
							var search_name = data.query.search.length ? data.query.search[0].title : "";
							search = search_name;
						},
						complete: function complete() {
							$.ajax({
								url: '//en.wikipedia.org/w/api.php',
								data: { action: 'query', titles: search, format: 'json', prop: 'categories' },
								dataType: 'jsonp',
								success: function success(data) {

									if ("query" in data) {
										var id = Object.keys(data.query.pages)[0];
										var categories = data.query.pages[id].categories;
										var death = void 0,
										    birth = void 0;

										var dataObject = data.query.pages[id];
										console.log(dataObject);

										for (var i = 0; i < (categories ? categories.length : 0); i++) {
											if (death = categories[i].title.match(/[0-9]+\sdeaths/)) {
												death = death[0].split(" ")[0];
												composer_object["death"] = death;
											} else if (birth = categories[i].title.match(/[0-9]+\sbirths/)) {
												birth = birth[0].split(" ")[0];
												composer_object["birth"] = birth;
											}
										}
									}
								},
								complete: function complete() {
									//if (composer_object["birth"]) {
									composers.push(composer_object);
									//}
								}

							});
						}
					});
				}
			}
		});
	});
});