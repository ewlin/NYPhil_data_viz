"use strict";

//data process to get # of works performed each season by living vs. deceased composers 
var seasons = {},
    percentagesLivingDead = void 0,
    percentagesFirstRepeat = void 0;

//generate seasons dynamically
var ALL_SEASONS = generateSeasons(1842, 2016);

function generateSeasons(start, end) {
	var seasons = [];

	for (var i = start; i <= end; i++) {
		var nextSeas = String(i + 1).slice(2, 4);
		seasons.push(String(i + "-" + nextSeas));
	}

	return seasons;
}

d3.json('../../data/composers.json', function (err, d) {

	d.forEach(function (composer) {
		var works = composer.works,
		    //[] of work objects
		birth = composer.birth,
		    death = composer.death;

		works.forEach(function (work) {
			work.seasons.forEach(function (season, idx) {
				//first time encountering season, should add object to object with season as key; 

				if (!seasons[season]) {
					seasons[season] = {
						alive: 0,
						dead: 0,
						unknown: 0,
						first: 0,
						repeat: 0
					};
				}

				//composer of work dead or alive during season (if composer died during season, consider alive)
				var perfYear = parseInt(season);

				if (birth == null && death == null) {
					++seasons[season]["unknown"];
				} else if (death) {
					perfYear > death ? ++seasons[season]["dead"] : ++seasons[season]["alive"];
				} else {
					++seasons[season]["alive"];
				}

				// quick + dirty way to grab whether a first performance or repeat
				idx == 0 ? ++seasons[season]["first"] : ++seasons[season]["repeat"];
			});
		});
	});

	//Debugging 
	console.log(seasons);

	percentagesLivingDead = ALL_SEASONS.map(function (season) {
		var _seasons$season = seasons[season],
		    unknown = _seasons$season.unknown,
		    alive = _seasons$season.alive,
		    dead = _seasons$season.dead,
		    total = unknown + alive + dead;


		return {
			season: season,
			total: total,
			percentageAlive: alive / total,
			percentageDead: dead / total
		};
	});

	percentagesFirstRepeat = ALL_SEASONS.map(function (season) {
		var _seasons$season2 = seasons[season],
		    first = _seasons$season2.first,
		    repeat = _seasons$season2.repeat,
		    total = first + repeat;


		return {
			season: season,
			total: total,
			percentageFirst: first / total,
			percentageRepeat: repeat / total
		};
	});

	console.log(movingAverageOfProps(percentagesLivingDead, ["percentageAlive", "percentageDead"]));
	console.log(movingAverageOfProps(percentagesFirstRepeat, ["percentageFirst", "percentageRepeat"]));

	var mirrored = percentagesLivingDead.map(function (d) {
		var season = d.season,
		    percentageAlive = d.percentageAlive,
		    percentageDead = d.percentageDead;


		return {
			season: season,
			percentageAlive: percentageAlive,
			percentageDead: -percentageDead
		};
	});
});

function movingAverageOfProps(array, keys) {
	return array.map(function (item, idx) {
		var beginIndex = idx - 4 >= 0 ? idx - 4 : 0,
		    endIndex = idx + 5,
		    collection = array.slice(beginIndex, endIndex),
		    collLength = collection.length,
		    movingAvgs = {};

		keys.forEach(function (key) {
			movingAvgs[key] = collection.reduce(function (sum, val) {
				return sum + val[key];
			}, 0) / collLength;
		});

		return Object.assign({ season: item.season }, movingAvgs);
	});
}

///End Data Processing 
///Begin Streamgraph rendering 

var SVG_HEIGHT = 600;
var SVG_WIDTH = 1200;

var SVG = d3.select(".container").append("svg").attr("x", 0).attr("y", 0).attr("width", SVG_WIDTH).attr("height", SVG_HEIGHT).attr("transform", "translate(0,30)");

//let xScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]).padding("3px"); 
//let yScale = d3.linearScale().domain([-1,1]).range([])
var x = d3.scaleLinear().domain([0, 174]).range([0, SVG_WIDTH]);
var y = d3.scaleLinear().domain([-1, 1]).range([SVG_HEIGHT, 0]);

var stack = d3.stack().keys(["percentageAlive", "percentageDead"]).offset(d3.stackOffsetSilhouette);

var area = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
	return x(i);
}).y0(function (d) {
	return y(d[0]);
}).y1(function (d) {
	return y(d[1]);
});

//SVG.selectAll("path")
//  //.data(stack1(movingAverageOfProps(statsPerc1)))
//	.data(testData)
//  .enter().append("path")
//    .attr("d", area)
//		.attr("fill", (d) => {
//			if (d.key == "percentageAlive") return "Tomato";
//			if (d.key == "percentageDead") return "Steelblue";
//		});
//.attr("stroke", "Black"); 

//SVG.append("rect")
//		.attr("x", 0)
//		.attr("y", 0)
//		.attr("width", SVG_WIDTH)
//		.attr("height", SVG_HEIGHT)
//		.attr("fill", "Red")
//		.attr("stroke", "White");