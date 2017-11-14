'use strict';

//SET UP CHART


//if mobile

//if desktop


//Deps. 
var generateSeasons = require('../../temp_utils/generate_seasons.js');
var movingAverage = require('../../temp_utils/moving_averages.js');
var ScrollMagic = require('scrollmagic');
var $ = require('jquery');
var debounce = require('just-debounce-it');

//track current graph to determine which 'd' attribute area to use
var currentGraph = 'abs';

//line drawing timer
var animateLine = void 0;

var PADDING = 25;
var SVG_HEIGHT = $(window).innerHeight() * .9;
//$('.container') is 80% of the width of div.outer-container (which is 100% of window), centered. 
var SVG_WIDTH = $('.container').innerWidth();

var SVG = d3.select('.container').append('svg').attr('x', 0).attr('y', 0).attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT)
//essentially a padding between chart + the graphic title
.attr('transform', 'translate(0,30)');

//let xScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]).padding("3px"); 
//let yScale = d3.linearScale().domain([-1,1]).range([])
//SET UP SCALES
var _x = d3.scaleLinear().domain([0, 174]).range([0, .8 * SVG_WIDTH]); //changed range to create space on right margin for annotation
var yAbs = d3.scaleLinear().range([SVG_HEIGHT - 4 * PADDING, 10]);
var yPct = d3.scaleLinear().domain([0, 1]).range([SVG_HEIGHT - 4 * PADDING, 10]);

var areaAbsolute = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
  return _x(i);
}).y0(function (d) {
  return yAbs(d[0]);
}).y1(function (d) {
  return yAbs(d[1]);
});

var areaPercentage = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
  return _x(i);
}).y0(function (d) {
  return yPct(d[0]);
}).y1(function (d) {
  return yPct(d[1]);
});

//annotations
var makeAnnotations = d3.annotation().type(d3.annotationLabel).accessors({
  x: function x(d) {
    return _x(d.i);
  },
  y: function y(d) {
    return yAbs(d.workCount);
  }
});

//data process to get # of works performed each season by living vs. deceased composers 
var seasons = {},
    percentagesLivingDead = void 0,
    percentagesFirstRepeat = void 0,
    percentagesOfRepeatsLiving = void 0,
    percentagesOfAllRepeatsLiving = void 0,
    totalWorksPerSeason = void 0,
    transition = void 0,
    transitionOrg = void 0,
    transition2 = void 0,
    transition3 = void 0,
    transitionLine = void 0,
    transitionLineExit = void 0,
    seasonsBuckets = Array.apply(null, Array(7)).map(function (_) {
  return {};
});

//generate seasons dynamically
var ALL_SEASONS = generateSeasons(1842, 2016);

// Dynamic margins on...
//Reuse when writing re-sizing code 

$('.explain p').css('margin-bottom', function () {
  return this.id !== 'last-explain' ? $(window).innerHeight() : 0;
});

//GITHUB pages bug 
//d3.json('/NYPhil_data_viz/data/composers.json', (err, d) => {

//DEV
d3.json('../../data/composers.json', function (err, d) {

  d.forEach(function (composer, composerIdx) {
    //[] of work objects
    var works = composer.works,
        birth = composer.birth,
        death = composer.death;

    works.forEach(function (work, workIdx) {
      var workID = composerIdx + ':' + workIdx;

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
          ++seasons[season]['unknown'];
        } else if (death) {
          perfYear > death ? ++seasons[season]['dead'] : (++seasons[season]['alive'], idx != 0 ? ++seasons[season]['repeatAlive'] : void 0);
        } else {
          ++seasons[season]['alive'];
          idx != 0 ? ++seasons[season]['repeatAlive'] : void 0;
        }
        // quick + dirty way to grab whether a first performance or repeat
        idx === 0 ? ++seasons[season]['first'] : ++seasons[season]['repeat'];
      });
    });
  });

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

  //console.log(MAX_NUMBER_PER_SEASON)

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

    //prevent dividing by 0

    repeat = repeat == 0 ? 1 : repeat;

    return {
      season: season,
      percentageOfRepeatsLiving: repeatAlive / repeat * 100
    };
  });

  percentagesOfLivingRepeats = ALL_SEASONS.map(function (season) {
    var _seasons$season5 = seasons[season],
        repeatAlive = _seasons$season5.repeatAlive,
        alive = _seasons$season5.alive;


    return {
      season: season,
      percentageOfRepeatsLiving: repeatAlive / alive
    };
  });

  percentagesOfAllRepeatsLiving = ALL_SEASONS.map(function (season) {
    var _seasons$season6 = seasons[season],
        repeatAlive = _seasons$season6.repeatAlive,
        repeat = _seasons$season6.repeat,
        first = _seasons$season6.first;


    total = repeat + first;

    return {
      season: season,
      percentageOfTotalRepeatsLiving: repeatAlive / total
      //percentageOfTotalRepeatsLiving: repeatAlive/total * 100 
    };
  });

  yAbs.domain([0, MAX_NUMBER_PER_SEASON]);

  var stack = d3.stack().keys(['percentageAlive', 'percentageDead']);

  var stackA = d3.stack().keys(['percentageFirst', 'percentageRepeat']);

  var stackB = d3.stack().keys(['first', 'repeat']);

  var yAxisAbs = d3.axisLeft().scale(yAbs).tickSize(0);

  var yAxisPct = d3.axisLeft().scale(yPct).tickSize(0).tickFormat(function (d) {
    return d * 100 + '%';
  });

  var xAxisYear = d3.axisBottom().scale(_x).tickValues([8, 33, 58, 83, 108, 133, 158, 174]).tickFormat(function (d) {
    return ALL_SEASONS[d];
  }).tickSize(10);

  var ORG_TEXTS = ['New York Phil first-time performance', 'Repeat performances'];

  //annotation experiment 
  var annotations = [{
    note: {
      title: '1909-10 Season',
      label: 'Gustav Mahler\'s first season as music director was also marked by a 3X increase in the number of concerts, from 18 to 54',
      wrap: 180
    },
    //can use x, y directly instead of data
    data: { i: 67, workCount: 105 },
    dy: -80,
    dx: -90
  }];

  SVG.append('g').attr('class', 'graph-content').selectAll('.path').data(stackB(totalWorksPerSeason)).enter().append('path')
  //Can also consolidate this with the scale; 
  .attr('transform', 'translate(' + 0.05 * SVG_WIDTH + ',0)').attr('d', areaAbsolute).attr('fill', function (d) {
    if (d.key == 'first') return 'Tomato';
    if (d.key == 'repeat') return 'Steelblue';
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

  //Add Y axis
  var yStreamAxis = SVG.append('g').attr('class', 'yAxis axis stream-axis')
  //FIX THIS; relative instead of absolute number
  //.attr('transform', 'translate(10,0)') // a bit short to the left
  .attr('transform', 'translate(' + 0.05 * SVG_WIDTH + ',0)').call(yAxisAbs);

  d3.select('.yAxis').select('.domain').remove();

  yStreamAxis.append('text').attr('class', 'axis-label stream-label y-axis-label').text('NUMBER OF UNIQUE COMPOSITIONS PER SEASON').attr('transform', 'rotate(-90)').attr('dy', -SVG_WIDTH * 0.038);

  //Add X axis
  var xStreamAxis = SVG.append('g').attr('class', 'xAxis axis stream-axis').attr('transform', 'translate(' + 0.05 * SVG_WIDTH + ',' + (SVG_HEIGHT - 3.9 * PADDING) + ')').call(xAxisYear);

  d3.select('.xAxis').select('.domain').remove();

  xStreamAxis.append('text').attr('class', 'axis-label x-axis-label stream-label').text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS').attr('transform', 'translate(' + SVG_WIDTH * .95 * .5 + ',' + 1.6 * PADDING + ')');

  makeAnnotations.annotations(annotations);

  SVG.append('g').attr('class', 'annotation-group').attr('transform', 'translate(' + 0.05 * SVG_WIDTH + ',0)').call(makeAnnotations);

  var line = d3.line().curve(d3.curveCardinal.tension(.1)).x(function (d, i) {
    return _x(i);
  }).y(function (d) {
    return yPct(d.percentageOfTotalRepeatsLiving);
  });

  var trendline = SVG.append('path').attr('class', 'trendline').attr('transform', 'translate(' + 0.05 * SVG_WIDTH + ',0)').datum(movingAverage(percentagesOfAllRepeatsLiving, ['percentageOfTotalRepeatsLiving'], 7))
  //.enter()
  .attr('fill', 'none').attr('stroke', 'rgb(218, 155, 103)').attr('stroke-dasharray', '7, 2').attr('d', function (d) {
    return line([{ percentageOfTotalRepeatsLiving: 0 }]);
  }).style('stroke-width', '2px');

  transitionOrg = function transitionOrg() {
    currentGraph = 'abs';

    var temp = SVG.selectAll('path').data(stackB(totalWorksPerSeason)).transition().duration(1400).attr('d', areaAbsolute).attr('fill', function (d) {
      if (d.key == 'first') return 'Tomato';
      if (d.key == 'repeat') return 'Steelblue';
    });

    SVG.select('.yAxis').transition().duration(1400).call(yAxisAbs);

    d3.select('.yAxis').select('.domain').remove();

    d3.select('.y-axis-label').transition().duration(1400).text('NUMBER OF UNIQUE COMPOSITIONS PER SEASON');

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
    currentGraph = 'pct';

    var TEXTS = ['Percentage of first-time performance', 'Percentage of repeat performances'];
    var newAnnotations = [];

    var stackData = stackA(percentagesFirstRepeat);
    var newStuff = SVG.selectAll('path').data(stackData);

    newStuff.transition().duration(1400).attr('d', areaPercentage).attr('fill', function (d) {
      if (d.key == 'percentageFirst') return 'Tomato';
      if (d.key == 'percentageRepeat') return 'Steelblue';
    }).each(function (data, i) {

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

    SVG.select('.yAxis').transition().duration(1400).call(yAxisPct);

    d3.select('.yAxis').select('.domain').remove();

    d3.select('.y-axis-label').transition().duration(1400).text('PERCENTAGE OF PIECES PER SEASON');
  };

  transition2 = function transition2() {
    currentGraph = 'pct';

    var TEXTS = ['Percentage of first-time performance', 'Percentage of repeat performances'];
    var newAnnotations = [];

    var newStuff = SVG.selectAll('path').data(stackA(movingAverage(percentagesFirstRepeat, ['percentageFirst', 'percentageRepeat'], 7)));

    newStuff.transition().duration(1400).attr('d', areaPercentage).attr('fill', function (d) {
      if (d.key == 'percentageFirst') return 'Tomato';
      if (d.key == 'percentageRepeat') return 'Steelblue';
    }).each(function (data, i) {

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
  };

  transition3 = function transition3() {
    currentGraph = 'pct';

    var MORE_TEXTS = ['Percentage of pieces by living composers', 'Percentage of pieces by deceased composers'];
    var newAnnotations = [];
    var newStuff = SVG.selectAll('path')
    //.data(stack(percentagesLivingDead)); 
    .data(stack(movingAverage(percentagesLivingDead, ['percentageAlive', 'percentageDead'], 7)));

    newStuff.transition().duration(1400).attr('d', areaPercentage).attr('fill', function (d) {
      if (d.key == 'percentageAlive') return '#ff645f';
      if (d.key == 'percentageDead') return '#7776bd';
    }).each(function (data, i) {

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
  };

  transitionLine = function transitionLine() {
    currentGraph = 'line';
    var MORE_TEXTS = ['Percentage of pieces by living composers', 'Percentage of pieces by deceased composers'];
    var startIndex = 0;

    animateLine = d3.timer(function () {
      if (startIndex >= 175) {
        animateLine.stop();
        makeAnnotations.annotations(annotations3);
      } else {
        startIndex += 1;
        trendline.attr('d', function (d) {
          return line(d.slice(0, startIndex));
        });
      }
    });

    var annotations3 = [];

    d3.select('.graph-content').selectAll('path').each(function (data, i) {
      annotations3.push({
        note: {
          //title: "Hello performances"
          title: MORE_TEXTS[i]
        },
        data: { i: 165, perc: (data[174][1] - data[174][0]) / 2 + data[174][0] },
        dy: -20,
        dx: SVG_WIDTH * .12
      });
    });

    annotations3.push({
      note: {
        //title: "Hello performances"
        title: 'Percentage of pieces that are repeat performances of music by a living composer',
        wrap: 155
      },
      data: { i: 79, perc: percentagesOfAllRepeatsLiving[79].percentageOfTotalRepeatsLiving },
      dy: -115,
      dx: -65
    });
  };

  transitionLineExit = function transitionLineExit() {

    if (animateLine) animateLine.stop();

    trendline.attr('d', function (d) {
      return line([{ percentageOfTotalRepeatsLiving: 0 }]);
    });

    //TODO Annotations to trendline is repainted/removed with a delay (concominant with transition3) and this is not good UX
  };

  var prose0 = new ScrollMagic.Scene({
    triggerElement: '.explain1',
    duration: 500,
    triggerHook: .5
  }).addTo(controller);

  var prose1 = new ScrollMagic.Scene({
    triggerElement: '.explain2',
    duration: 500,
    triggerHook: .5
  }).addTo(controller);

  var prose2 = new ScrollMagic.Scene({
    triggerElement: '.explain3',
    //duration: 500, 
    triggerHook: .5
  }).addTo(controller);

  var prose3 = new ScrollMagic.Scene({
    triggerElement: '.explain4',
    duration: 500,
    triggerHook: .5
  }).addTo(controller);

  var prose4 = new ScrollMagic.Scene({
    triggerElement: '.explain5',
    duration: 500,
    triggerHook: .5
  }).addTo(controller);

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

  prose3.on('leave', function (e) {
    //console.log("fourth"); 
    if (e.scrollDirection === 'REVERSE') transition2();
  });

  prose4.on('enter', function (e) {
    console.log('LAST');
    if (e.scrollDirection === 'FORWARD') transitionLine();
  });

  prose4.on('leave', function (e) {
    if (e.scrollDirection === 'REVERSE') transitionLineExit();
  });

  function resize() {
    //update scales
    SVG_HEIGHT = $(window).innerHeight() * .9;
    SVG_WIDTH = $('.container').innerWidth();
    SVG.attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT);
    _x.range([0, .8 * SVG_WIDTH]);
    yAbs.range([SVG_HEIGHT - 4 * PADDING, 10]);
    yPct.range([SVG_HEIGHT - 4 * PADDING, 10]);

    SVG.select('.xAxis').attr('transform', 'translate(' + 0.05 * SVG_WIDTH + ',' + (SVG_HEIGHT - 3.9 * PADDING) + ')').call(xAxisYear);
    SVG.select('.xAxis').select('.domain').remove();

    if (currentGraph === 'abs') {
      SVG.select('.graph-content').selectAll('path').attr('d', areaAbsolute);
      SVG.select('.yAxis').call(yAxisAbs);
    } else {
      SVG.select('.graph-content').selectAll('path').attr('d', areaPercentage);
      SVG.select('.yAxis').call(yAxisPct);
    }

    SVG.select('.yAxis').select('.domain').remove();

    if (currentGraph === 'line') {
      var startIndex = 0;
      if (animateLine) animateLine.stop();
      animateLine = d3.timer(function () {
        if (startIndex >= 175) {
          animateLine.stop();
          //makeAnnotations.annotations(annotations3); 
        } else {
          startIndex += 1;
          d3.select('.trendline').attr('d', function (d) {
            return line(d.slice(0, startIndex));
          });
        }
      });
    } else {
      SVG.select('.trendline').attr('d', function (d) {
        return line([{ percentageOfTotalRepeatsLiving: 0 }]);
      });
    }

    //console.log('resized'); 
    SVG.select('g.annotation-group').call(makeAnnotations);
    makeAnnotations.updatedAccessors();
    //makeAnnotations.annotations(annotations); 
  }

  window.addEventListener('resize', debounce(resize, 200));
});

var controller = new ScrollMagic.Controller();

var containerScroll = document.querySelector('.outer-container');

var scene = new ScrollMagic.Scene({
  triggerElement: '.outer-container',
  duration: containerScroll.offsetHeight - window.innerHeight,
  triggerHook: 0
}).addTo(controller);

scene.on('enter', function () {
  console.log('fixed');
  $('.inner-container').addClass('fixed');
});

scene.on('leave', function (e) {
  console.log('exit scene');
  $('.inner-container').removeClass('fixed');
  if (e.scrollDirection === 'FORWARD') {
    $('.inner-container').addClass('at-bottom');
  } else {
    $('.inner-container').removeClass('at-bottom');
  }
});

//let controller = new ScrollMagic.Controller();
//let containerScroll = document.querySelector('.outer-container'); 
//
//let scene = new ScrollMagic.Scene({
//																	 triggerElement: ".outer-container", 
//																	 duration: containerScroll.offsetHeight - window.innerHeight, 
//																	 triggerHook: 0
//																	})
//					.addTo(controller);
//
//let prose0 = new ScrollMagic.Scene({
//																	 triggerElement: ".explain1", 
//																	 //duration: 500, 
//																	 triggerHook: .5
//																	})
//						.addTo(controller);
//
//let prose1 = new ScrollMagic.Scene({
//																	 triggerElement: ".explain2", 
//																	 //duration: 500, 
//																	 triggerHook: .5
//																	})
//						.addTo(controller);
//
//let prose2 = new ScrollMagic.Scene({
//																	 triggerElement: ".explain3", 
//																	 //duration: 500, 
//																	 triggerHook: .5
//																	})
//						.addTo(controller);
//
//let prose3 = new ScrollMagic.Scene({
//																	 triggerElement: ".explain4", 
//																	 duration: 500, 
//																	 triggerHook: .5
//																	})
//						.addTo(controller);
//
//let prose4 = new ScrollMagic.Scene({
//																	 triggerElement: ".explain5", 
//																	 duration: 500, 
//																	 triggerHook: .5
//																	})
//						.addTo(controller);
//
//scene.on('enter', () => {
//	console.log("fixed"); 
//	$('.inner-container').addClass("fixed"); 
//});  
//
//scene.on('leave', (e) => {
//	console.log('exit scene'); 
//	$('.inner-container').removeClass("fixed"); 
//	if (e.scrollDirection === 'FORWARD') {
//		$('.inner-container').addClass('at-bottom'); 
//	} else {
//		$('.inner-container').removeClass('at-bottom'); 
//	}
//});