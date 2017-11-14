'use strict';

var generateSeasons = require('../../temp_utils/generate_seasons.js');
var ScrollMagic = require('scrollmagic');
//data process to get # of works performed each season by living vs. deceased composers 
var seasons = {},
    percentagesLivingDead = void 0,
    percentagesFirstRepeat = void 0,
    percentagesOfRepeatsLiving = void 0,
    totalWorksPerSeason = void 0,
    transition = void 0,
    transitionOrg = void 0,
    transition2 = void 0,
    transition3 = void 0,
    seasonsBuckets = Array.apply(null, Array(7)).map(function (_) {
	return {};
});

var sorted = void 0;

//generate seasons dynamically
var ALL_SEASONS = generateSeasons(1842, 2016);

//function generateSeasons (start, end) {
//	let seasons = []; 
//	
//	for (let i=start; i<=end; i++) {
//		let nextSeas = String(i+1).slice(2,4);
//		seasons.push(String(`${i}-${nextSeas}`)); 
//	}
//	
//	return seasons; 
//}

function group(array, numPerGroup) {
	numPerGroup = numPerGroup || array.length;
	var groups = [];

	while (array.length) {
		groups.push(array.slice(0, numPerGroup));
		array = array.slice(numPerGroup);
	}

	return groups;
}

// Dynamic margins on...
//Reuse when writing re-sizing code 

$('.explain p').css('margin-bottom', function () {
	console.log(this);
	return this.id !== 'last-explain' ? $(window).innerHeight() : 0;
});

//GITHUB pages bug 
//d3.json('/NYPhil_data_viz/data/composers.json', (err, d) => {

//DEV
d3.json('../../data/composers.json', function (err, d) {

	d.forEach(function (composer, composerIdx) {
		var works = composer.works,
		    //[] of work objects
		birth = composer.birth,
		    death = composer.death;

		works.forEach(function (work, workIdx) {

			//create custom composition ID number 
			var workID = composerIdx + ":" + workIdx;

			work.seasons.forEach(function (season, idx) {
				//first time encountering season, should add object to object with season as key; 

				if (!seasons[season]) {
					seasons[season] = {
						repeat: 0,
						repeatAlive: 0,
						alive: 0,
						dead: 0,
						unknown: 0,
						first: 0,
						composers: {}
					};
				}

				//composer of work dead or alive during season (if composer died during season, consider alive)
				var perfYear = parseInt(season);

				if (birth == null && death == null) {
					++seasons[season]["unknown"];
				} else if (death) {
					perfYear > death ? ++seasons[season]["dead"] : (++seasons[season]["alive"], idx != 0 ? ++seasons[season]["repeatAlive"] : void 0);
				} else {
					++seasons[season]["alive"];
					idx != 0 ? ++seasons[season]["repeatAlive"] : void 0;
				}

				// quick + dirty way to grab whether a first performance or repeat
				idx == 0 ? ++seasons[season]["first"] : ++seasons[season]["repeat"];

				// sort compositions into season buckets

				var bucket = Math.floor((perfYear - 1842) / 25);

				//Here's where the bug is happening. UPDATE: Fixed
				seasonsBuckets[bucket][workID] ? ++seasonsBuckets[bucket][workID]["count"] : seasonsBuckets[bucket][workID] = { title: work.title, composer: composer.composer, count: 1 };

				//Calculate either age of living composers, or how long ago the composer died 

				if (!seasons[season]["composers"][composerIdx]) {
					//calculate age: Number. if alive (positive), if dead (negative)
					var ageDuringSeason = void 0;

					if (birth == null && death == null) {
						ageDuringSeason = null;
					} else if (death != null || death == null && birth) {
						ageDuringSeason = death == null && birth || death >= perfYear ? perfYear - birth : death - perfYear;
					}

					seasons[season]["composers"][composerIdx] = {
						composer: composer,
						ageDuringSeason: ageDuringSeason,
						numberOfPieces: 1
					};
				} else {
					++seasons[season]["composers"][composerIdx]["numberOfPieces"];
				}
			});
		});
	});

	//Debugging 
	console.log(seasons);

	totalWorksPerSeason = ALL_SEASONS.map(function (season) {
		var _seasons$season = seasons[season],
		    first = _seasons$season.first,
		    repeat = _seasons$season.repeat,
		    total = first + repeat;


		return {
			season: season,
			total: total,
			first: first,
			repeat: repeat
		};
	});

	var MAX_NUMBER_PER_SEASON = totalWorksPerSeason.reduce(function (best, current) {
		return best > current.total ? best : current.total;
	}, 0);

	console.log(MAX_NUMBER_PER_SEASON);

	percentagesLivingDead = ALL_SEASONS.map(function (season) {
		var _seasons$season2 = seasons[season],
		    unknown = _seasons$season2.unknown,
		    alive = _seasons$season2.alive,
		    dead = _seasons$season2.dead,
		    total = unknown + alive + dead;


		return {
			season: season,
			total: total,
			percentageAlive: alive / total,
			percentageDead: dead / total
		};
	});

	percentagesFirstRepeat = ALL_SEASONS.map(function (season) {
		var _seasons$season3 = seasons[season],
		    first = _seasons$season3.first,
		    repeat = _seasons$season3.repeat,
		    total = first + repeat;


		return {
			season: season,
			total: total,
			percentageFirst: first / total,
			percentageRepeat: repeat / total
		};
	});

	percentagesOfRepeatsLiving = ALL_SEASONS.map(function (season) {
		var _seasons$season4 = seasons[season],
		    repeatAlive = _seasons$season4.repeatAlive,
		    repeat = _seasons$season4.repeat;


		repeat = repeat == 0 ? 1 : repeat;

		return {
			season: season,
			percentageOfRepeatsLiving: repeatAlive / repeat * 100
		};
	});

	percentagesOfAllRepeatsLiving = ALL_SEASONS.map(function (season) {
		var _seasons$season5 = seasons[season],
		    repeatAlive = _seasons$season5.repeatAlive,
		    repeat = _seasons$season5.repeat,
		    alive = _seasons$season5.alive;


		total = repeat + alive;

		return {
			season: season,
			percentageOfTotalRepeatsLiving: repeatAlive / total * 100
		};
	});

	console.log(movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 7));
	//console.log(movingAverageOfProps(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"])); 
	console.log(percentagesOfRepeatsLiving);
	console.log(percentagesOfAllRepeatsLiving);

	//array-ify season buckets so I can sort 
	var sortedSeasonBuckets = seasonsBuckets.map(function (bucket) {
		var arr = [];
		for (var id in bucket) {
			arr.push([id, bucket[id]]);
		}
		return arr;
	});

	sortedSeasonBuckets.forEach(function (bucket) {
		bucket.sort(function (a, b) {
			return b[1].count - a[1].count;
		});
	});

	console.log(sortedSeasonBuckets);

	sorted = sortedSeasonBuckets;
	//Add rankings Done!!!
	var rankings = sortedSeasonBuckets.map(function (bucket) {
		var currentRank = 1;
		var currentCount = bucket[0][1].count;
		var withSameCount = 0;

		return bucket.map(function (composition) {

			var compositionCount = composition[1].count;

			if (currentCount !== compositionCount) {
				currentRank += withSameCount;
				currentCount = compositionCount;
				withSameCount = 1;
			} else {
				withSameCount++;
			}
			return composition.concat(currentRank);
		});
	});

	//generalized solution to ranking items in an array
	//assuming array is of objects with some id AND a value to rank by

	//so far, this assumes the array is already sorted 
	function ranking(array, /* array of arrays */accessor) {
		var currentRank = 1,

		//currentValue = array[0][1].count, //initial value from first item in array
		currentValue = accessor.call(null, array[0]),
		    withSameValue = 0;

		return array.map(function (item) {
			var itemValue = accessor.call(null, item); //again, use acessor function to grab this 

			if (itemValue !== currentValue) {
				currentRank += withSameValue;
				currentValue = itemValue;
				withSameValue = 1;
			} else {
				withSameValue++;
			}

			return item.concat(currentRank);
		});
	}

	//


	console.log(rankings);

	//update to include upto a certain position 
	//slice until logic. 1) remove US anthem 2) Keep taking until you hit next most often. If number 15 has 10 performances, take the rest of the pieces with at least 10 performances even if that results in more than 15 total pieces for that bucket. 

	//sortedSeasonBuckets.forEach((bucket,idx) => {
	//	let total = bucket.reduce((sum, piece) => {
	//		return sum + piece[1].count; 
	//	}, 0);
	//	console.log(idx);
	//	console.log(total);
	//});
	//let top15 = sortedSeasonBuckets.map((bucket,idx) => {


	///End Data Processing 
	///Begin Streamgraph rendering 

	console.log("width: ");
	console.log($('.container').innerWidth());
	var PADDING = 25;
	var SVG_HEIGHT = $(window).innerHeight() * .9;
	//$('.container') is 80% of the width of div.outer-container (which is 100% of window), centered. 
	var SVG_WIDTH = $('.container').innerWidth();

	var SVG = d3.select(".container").append("svg").attr("x", 0).attr("y", 0).attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT).attr("transform", "translate(0,30)");

	//let xScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]).padding("3px"); 
	//let yScale = d3.linearScale().domain([-1,1]).range([])
	var _x = d3.scaleLinear().domain([0, 174]).range([0, .8 * SVG_WIDTH]); //changed range to create space on right margin for annotation
	var y = d3.scaleLinear().domain([0, 1]).range([SVG_HEIGHT - 4 * PADDING, 10]);

	var yAbs = d3.scaleLinear().domain([0, MAX_NUMBER_PER_SEASON]).range([SVG_HEIGHT - 4 * PADDING, 10]);
	var yPct = d3.scaleLinear().domain([0, 1]).range([SVG_HEIGHT - 4 * PADDING, 10]);

	var stack = d3.stack().keys(["percentageAlive", "percentageDead"]);

	var stackA = d3.stack().keys(["percentageFirst", "percentageRepeat"]);

	var stackB = d3.stack().keys(["first", "repeat"]);

	var areaAbsolute = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
		return _x(i);
	}).y0(function (d) {
		return yAbs(d[0]);
	}).y1(function (d) {
		return yAbs(d[1]);
	});

	var yAxisAbs = d3.axisLeft().scale(yAbs).tickSize(0);

	var yAxisPct = d3.axisLeft().scale(yPct).tickSize(0).tickFormat(function (d) {
		return d * 100 + '%';
	});

	var xAxisYear = d3.axisBottom().scale(_x).tickValues([8, 33, 58, 83, 108, 133, 158, 174]).tickFormat(function (d) {
		return ALL_SEASONS[d];
	})

	//.map( i => {
	//	return ALL_SEASONS[i]; 
	//})) 
	.tickSize(10);

	var areaPercentage = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
		return _x(i);
	}).y0(function (d) {
		return y(d[0]);
	}).y1(function (d) {
		return y(d[1]);
	});

	var area = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
		return _x(i);
	}).y0(function (d) {
		return y(d[0]);
	}).y1(function (d) {
		return y(d[1]);
	});

	var ORG_TEXTS = ['New York Phil first-time performance', 'Repeat performances'];

	//annotation experiment 
	var annotations = [{
		note: {
			title: "1909-10 Season",
			label: "Gustav Mahler's first season as music director was also marked by a 3X increase in the number of concerts, from 18 to 54"
		},
		//can use x, y directly instead of data
		data: { i: 67, workCount: 105 },
		dy: -80,
		dx: -90
	}];

	//, {
	//	note: {
	//		title: "Repeat performances"
	//	}, 
	//	data: { i: 170, workCount: 48 }, 
	//	dy: -20,
	//	dx: SVG_WIDTH * .07
	//}, {
	//	note: {
	//		title: "New York Phil first-time performance"
	//	}, 
	//	data: { i: 170, workCount: 9 }, 
	//	dy: -20,
	//	dx: SVG_WIDTH * .07
	//}]; 

	SVG.append('g').selectAll("path").data(stackB(totalWorksPerSeason)).enter().append("path")
	//Can also consolidate this with the scale; 
	.attr("transform", 'translate(' + 0.05 * SVG_WIDTH + ',0)').attr("d", areaAbsolute).attr("fill", function (d) {
		if (d.key == "first") return "Tomato";
		if (d.key == "repeat") return "Steelblue";
	}).each(function (data, i) {
		annotations.push({
			note: {
				//title: "Hello performances"
				title: ORG_TEXTS[i]
			},
			data: { i: 165, workCount: (data[174][1] - data[174][0]) / 2 + data[174][0] },
			dy: -20,
			dx: SVG_WIDTH * .12
		});
	});

	//SVG.selectAll("text")
	//	.data(stackB(totalWorksPerSeason))
	//	.enter()
	//	.append("text")
	//	.attr("x", 600)
	//	.attr("y", (d, i) => {
	//		//Math.abs((-i+2) * 200)
	//		return i == 0 ? SVG_HEIGHT - 120 : $(window).innerHeight()/2; 
	//	}).text(d => {
	//			let text = d.key.match(/[A-Z][a-z0-9]*/); 
	//			return text ? text[0] : d.key;  	 
	//	}); 

	//Add Y axis
	var yStreamAxis = SVG.append("g").attr("class", "yAxis axis stream-axis").attr("transform", "translate(50,0)").call(yAxisAbs);

	d3.select(".yAxis").select(".domain").remove();

	yStreamAxis.append('text').attr('class', 'axis-label stream-label y-axis-label').text('NUMBER OF COMPOSITIONS PER SEASON').attr("transform", "rotate(-90)").attr('dy', -SVG_WIDTH * 0.038);

	//Add X axis
	var xStreamAxis = SVG.append("g").attr("class", "xAxis axis stream-axis").attr("transform", 'translate(' + 0.05 * SVG_WIDTH + ',' + (SVG_HEIGHT - 3.9 * PADDING) + ')').call(xAxisYear);

	d3.select(".xAxis").select(".domain").remove();

	xStreamAxis.append('text').attr('class', 'axis-label x-axis-label stream-label').text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS').attr('transform', 'translate(' + SVG_WIDTH * .95 * .5 + ',' + 1.6 * PADDING + ')');

	var makeAnnotations = d3.annotation().type(d3.annotationLabel).accessors({
		x: function x(d) {
			return _x(d.i);
		},
		y: function y(d) {
			return yAbs(d.workCount);
		}
	}).annotations(annotations);

	SVG.append("g").attr("class", "annotation-group").attr("transform", 'translate(' + 0.05 * SVG_WIDTH + ',0)').call(makeAnnotations);

	transitionOrg = function transitionOrg() {
		var temp = SVG.selectAll("path").data(stackB(totalWorksPerSeason)).transition().duration(1400).attr("d", areaAbsolute).attr("fill", function (d) {
			if (d.key == "first") return "Tomato";
			if (d.key == "repeat") return "Steelblue";
		});

		//let text = SVG.selectAll("text")
		//					.data(stackB(totalWorksPerSeason)); 

		//SVG.select('.annotation-group').transition().duration(1400).style('opacity', 1); 

		//text.transition()
		//		.duration(1400)
		//		.text(d => d.key);

		SVG.select(".yAxis").transition().duration(1400).call(yAxisAbs);

		d3.select(".yAxis").select(".domain").remove();

		d3.select('.y-axis-label').transition().duration(1400).text('NUMBER OF COMPOSITIONS PER SEASON');

		makeAnnotations.accessors({
			x: function x(d) {
				return _x(d.i);
			},
			y: function y(d) {
				return yAbs(d.workCount);
			}
		}).annotations(annotations);
	};

	transition = function transition() {
		var TEXTS = ['Percentage of first-time performance', 'Percentage of repeat performances'];
		var newAnnotations = [];

		var stackData = stackA(percentagesFirstRepeat);
		var newStuff = SVG.selectAll("path")
		//.data(stack(percentagesLivingDead)); 
		.data(stackData);
		//.data(stackA(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7))); 

		//let text = SVG.selectAll("text")
		//	.data(stackA(percentagesFirstRepeat)); 
		//.data(stackA(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7))); 

		//newStuff.exit().remove()//.attr("d",areaInit)//.attr("fill", (d) => {
		//if (d.key == "pctFirstSingle") return "Steelblue";
		//if (d.key == "pctFirstMult") return "Tomato";
		//if (d.key == "pctRepeat") return "#59273e";
		//})

		//SVG.select('.annotation-group').transition().duration(1400).style('opacity', 0); 

		newStuff.transition().duration(1400).attr("d", area).attr("fill", function (d) {
			if (d.key == "percentageFirst") return "Tomato";
			if (d.key == "percentageRepeat") return "Steelblue";
		}).each(function (data, i) {
			//Do hard-coded text instead--e.g. an array of strings to match up/pair up
			//let text = data.key.match(/[A-Z][a-z0-9]*/); 
			//let match = text ? text[0] : data.key;

			console.log(this);
			console.log(this.parentNode);
			console.log(this == this.parentNode.lastChild);
			makeAnnotations.accessors({
				x: function x(d) {
					return _x(d.i);
				},
				y: function y(d) {
					return yPct(d.perc);
				}
			});

			newAnnotations.push({
				note: {
					//title: "Hello performances"
					title: TEXTS[i]
				},
				data: { i: 165, perc: (data[174][1] - data[174][0]) / 2 + data[174][0] },
				dy: -20,
				dx: SVG_WIDTH * .12
			});

			if (this == this.parentNode.lastChild) makeAnnotations.annotations(newAnnotations);
		}).on('end', function (data) {
			//makeAnnotations.annotations(newAnnotations); 
			//SVG.select('.annotation-group').style('opacity', 1); 

			//console.log(data); 
			//makeAnnotations.annotations([{
			//	note: {
			//		//title: "Hello performances"
			//		title: match
			//	}, 
			//	data: { i: 170, perc: (data[170][1] - data[170][0])/2 }, 
			//	dy: -20,
			//	dx: SVG_WIDTH * .07
			//}, {
			//	note: {
			//		//title: "Hello performances"
			//		title: match
			//	}, 
			//	data: { i: 170, perc: (data[174][1] - data[174][0])/2 + data[174][0] }, 
			//	dy: -20,
			//	dx: SVG_WIDTH * .07
			//}]); 

			//SVG.select('.annotation-group').style('opacity', 1); 
		});

		//text.transition()
		//		.duration(1400)
		//		.text(d => {
		//			let text = d.key.match(/[A-Z][a-z0-9]*/); 
		//			return text ? text[0] : d.key;  	 
		//		});

		SVG.select(".yAxis").transition().duration(1400).call(yAxisPct);

		d3.select(".yAxis").select(".domain").remove();

		d3.select('.y-axis-label').transition().duration(1400).text("PERCENTAGE OF PIECES PER SEASON");
	};

	transition2 = function transition2() {
		var TEXTS = ['Percentage of first-time performance', 'Percentage of repeat performances'];
		var newAnnotations = [];

		var newStuff = SVG.selectAll("path")
		//.data(stack(percentagesLivingDead)); 
		//.data(stackA(percentagesFirstRepeat)); 
		.data(stackA(movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 7)));
		//.data(stackA(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7))); 
		console.log(movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 7));
		//let text = SVG.selectAll("text")
		//	//.data(stackA(percentagesFirstRepeat)); 
		//		.data(stackA(movingAverageWithRange(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"], 9)));

		//newStuff.exit().remove()//.attr("d",areaInit)//.attr("fill", (d) => {
		//if (d.key == "pctFirstSingle") return "Steelblue";
		//if (d.key == "pctFirstMult") return "Tomato";
		//if (d.key == "pctRepeat") return "#59273e";
		//})
		newStuff.transition().duration(1400).attr("d", area).attr("fill", function (d) {
			if (d.key == "percentageFirst") return "Tomato";
			if (d.key == "percentageRepeat") return "Steelblue";
		}).each(function (data, i) {
			//Do hard-coded text instead--e.g. an array of strings to match up/pair up
			//let text = data.key.match(/[A-Z][a-z0-9]*/); 
			//let match = text ? text[0] : data.key;

			console.log(this);
			console.log(this.parentNode);
			console.log(this == this.parentNode.lastChild);
			makeAnnotations.accessors({
				x: function x(d) {
					return _x(d.i);
				},
				y: function y(d) {
					return yPct(d.perc);
				}
			});

			newAnnotations.push({
				note: {
					//title: "Hello performances"
					title: TEXTS[i]
				},
				data: { i: 165, perc: (data[174][1] - data[174][0]) / 2 + data[174][0] },
				dy: -20,
				dx: SVG_WIDTH * .12
			});

			if (this == this.parentNode.lastChild) makeAnnotations.annotations(newAnnotations);
		});

		//text.transition()
		//		.duration(1400)
		//		.text(d => {
		//			let text = d.key.match(/[A-Z][a-z0-9]*/); 
		//			return text ? text[0] : d.key;  	 
		//		}); 


		//.attr("d", area)
		//.attr("fill", (d) => {
		//		if (d.key == "pctFirstSingle") return "Steelblue";
		//		if (d.key == "pctFirstMult") return "Tomato";
		//		if (d.key == "pctRepeat") return "Grey";
		//}); 
	};

	transition3 = function transition3() {
		var MORE_TEXTS = ['Percentage of living composers', 'Percentage of deceased composers'];
		var newAnnotations = [];
		var newStuff = SVG.selectAll("path")
		//.data(stack(percentagesLivingDead)); 
		.data(stack(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7)));
		console.log(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 7));
		//let text = SVG.selectAll("text")
		//		.data(stack(movingAverageWithRange(percentagesLivingDead, ["percentageAlive", "percentageDead"], 9))); 

		newStuff.transition().duration(1400).attr("d", area).attr("fill", function (d) {
			if (d.key == "percentageAlive") return "#ff645f";
			if (d.key == "percentageDead") return "#7776bd";
		}).each(function (data, i) {
			//Do hard-coded text instead--e.g. an array of strings to match up/pair up
			//let text = data.key.match(/[A-Z][a-z0-9]*/); 
			//let match = text ? text[0] : data.key;

			console.log(this);
			console.log(this.parentNode);
			console.log(this == this.parentNode.lastChild);
			makeAnnotations.accessors({
				x: function x(d) {
					return _x(d.i);
				},
				y: function y(d) {
					return yPct(d.perc);
				}
			});

			newAnnotations.push({
				note: {
					//title: "Hello performances"
					title: MORE_TEXTS[i]
				},
				data: { i: 165, perc: (data[174][1] - data[174][0]) / 2 + data[174][0] },
				dy: -20,
				dx: SVG_WIDTH * .12
			});

			if (this == this.parentNode.lastChild) makeAnnotations.annotations(newAnnotations);
		});

		//text.transition()
		//		.duration(1400)
		//		.text(d => {
		//			let text = d.key.match(/[A-Z][a-z0-9]*/); 
		//			return text ? text[0] : d.key;  	 
		//		}); 
	};

	prose0.on('enter', function () {
		//console.log("first"); 
		transitionOrg();
	});

	prose1.on('enter', function () {
		//console.log("second"); 
		transition();
	});

	prose2.on('enter', function () {
		//console.log("third"); 
		transition2();
	});

	prose3.on('enter', function () {
		//console.log("fourth"); 
		transition3();
	});
});

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
	var lastIndex = array.length - 1,
	    padding = Math.floor(range / 2),
	    maxIndex = lastIndex - padding;

	return array.map(function (item, idx) {

		if (idx < padding || idx > maxIndex) return item;

		var beginIndex = idx - padding >= 0 ? idx - padding : 0,
		    endIndex = idx + padding + 1,
		    collection = array.slice(beginIndex, endIndex),

		//collLength = collection.length,
		movingAvgs = {};

		if (!keys) {
			return collection.reduce(function (sum, val) {
				return sum + val;
			}, 0) / range;
		}

		keys.forEach(function (key) {
			movingAvgs[key] = collection.reduce(function (sum, val) {
				return sum + val[key];
			}, 0) / range;
		});

		//TODO: Generalized this
		return Object.assign({ season: item.season }, movingAvgs);
		//return Object.assign(movingAvgs, omit(item, keys));
	});
}

//
var composersAlive = {};
var medianAges = [];
for (var year in seasons) {
	var composers = seasons[year]["composers"];
	var alive = [];
	var averageAge = void 0;
	var medianAge = void 0;
	//console.log(composers); 
	for (var comp in composers) {
		//console.log(composers[comp].ageDuringSeason); 
		if (composers[comp].ageDuringSeason > 0) {
			alive.push(composers[comp].ageDuringSeason);
		}
	}
	//console.log(alive); 
	averageAge = alive.reduce(function (sum, age) {
		return sum + age;
	}) / alive.length;
	medianAges.push(alive[Math.floor(alive.length / 2)]);
	//composersAlive[year] = {averageAge: alive}; 
}

//const ScrollMagic = require('scrollmagic'); 
var controller = new ScrollMagic.Controller();
var containerScroll = document.querySelector('.outer-container');

var scene = new ScrollMagic.Scene({
	triggerElement: ".outer-container",
	duration: containerScroll.offsetHeight - window.innerHeight,
	triggerHook: 0
}).addTo(controller);

var prose0 = new ScrollMagic.Scene({
	triggerElement: ".explain1",
	duration: 500,
	triggerHook: .5
}).addTo(controller);

var prose1 = new ScrollMagic.Scene({
	triggerElement: ".explain2",
	duration: 500,
	triggerHook: .5
}).addTo(controller);

var prose2 = new ScrollMagic.Scene({
	triggerElement: ".explain3",
	duration: 500,
	triggerHook: .5
}).addTo(controller);

var prose3 = new ScrollMagic.Scene({
	triggerElement: ".explain4",
	duration: 500,
	triggerHook: .5
}).addTo(controller);

scene.on('enter', function () {
	console.log("fixed");
	$('.inner-container').addClass("fixed");
});

scene.on('leave', function (e) {
	console.log('exit scene');
	$('.inner-container').removeClass("fixed");
	if (e.scrollDirection === 'FORWARD') {
		$('.inner-container').addClass('at-bottom');
	} else {
		$('.inner-container').removeClass('at-bottom');
	}
});