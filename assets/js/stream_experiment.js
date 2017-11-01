//SET UP CHART


//if mobile
  
//if desktop

//Deps. 
let generateSeasons = require('../../temp_utils/generate_seasons.js'); 
let movingAverage = require('../../temp_utils/moving_averages.js'); 
let isMobile = require('../../temp_utils/is-mobile.js'); 
let ScrollMagic = require('scrollmagic'); 
let $ = require('jquery');
let debounce = require('just-debounce-it'); 

console.log(isMobile);
if (isMobile().any()) console.log('yes'); 


//track current graph to determine which 'd' attribute area to use
let currentGraph = 'abs'; 

//line drawing timer
let animateLine; 

const PADDING = 25; 
let MARGINS = {}; 
let SVG_WIDTH = $('.container').innerWidth();
let SVG_HEIGHT = $(window).innerHeight() * 0.9; 

//let SVG_HEIGHT = SVG_WIDTH > '550' ? $(window).innerHeight() * 0.9 : $(window).innerHeight() * 0.8; 
//$('.container') is 80% of the width of div.outer-container (which is 100% of window), centered. 


const SVG = d3.select('.container')
  .append('svg')
  .attr('x', 0)
  .attr('y', 0)
  .attr('width', SVG_WIDTH)
  .attr('height', SVG_HEIGHT)
  //essentially a padding between chart + the graphic title
  .attr('transform', 'translate(0,30)');

//let xScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]).padding("3px"); 
//let yScale = d3.linearScale().domain([-1,1]).range([])
//SET UP SCALES
let x = d3.scaleLinear().domain([0, 174]).range([0, .92 * SVG_WIDTH]); //changed range to create space on right margin for annotation
let yAbs = d3.scaleLinear().range([SVG_HEIGHT-4*PADDING, 10]);
let yPct = d3.scaleLinear().domain([0, 1]).range([SVG_HEIGHT-4*PADDING, 10]);

let areaAbsolute = d3.area()
  .curve(d3.curveCardinal.tension(.1))
  .x((d, i) => x(i) )
  .y0(d => yAbs( d[0]) )
  .y1(d => yAbs( d[1]) ); 

let areaPercentage = d3.area()
  .curve(d3.curveCardinal.tension(.1))
  .x((d, i) => x(i) )
  .y0(d => yPct( d[0]) )
  .y1(d => yPct( d[1]) ); 

//annotations
let makeAnnotations = d3.annotation().type(d3.annotationLabel)
  .accessors({
    x: d => x(d.i),
    y: d => yAbs(d.workCount)
  }); 

//data process to get # of works performed each season by living vs. deceased composers 
let seasons = {},
    percentagesLivingDead, 
    percentagesFirstRepeat, 
    percentagesOfRepeatsLiving, 
    percentagesOfAllRepeatsLiving, 
    totalWorksPerSeason, 
    transition, 
    transitionOrg, 
    transition2, 
    transition3,
    transitionLine, 
    transitionLineExit;
    //seasonsBuckets = Array.apply(null,Array(7)).map((_) => {
    //  return {};
    //});

//generate seasons dynamically
const ALL_SEASONS = generateSeasons(1842, 2016); 


// Dynamic margins on...
//Reuse when writing re-sizing code 
$('#first-explain').css('margin-top', $(window).innerHeight()/2); 

$('.explain p').css('margin-bottom', function() {
  return this.id !== 'last-explain' ? $(window).innerHeight() : 0; 
}); 

                    
//GITHUB pages bug 
//d3.json('/NYPhil_data_viz/data/composers.json', (err, d) => {

//DEV
d3.json('../../data/composers.json', (err, d) => {
	
  d.forEach( (composer, composerIdx) => {  //[] of work objects
    let works = composer.works,
        birth = composer.birth,
        death = composer.death; 
		
		
    works.forEach((work, workIdx) => {
      let workID = composerIdx + ':' + workIdx;
			
      work.seasons.forEach( (season, idx) => {
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
        let perfYear = parseInt(season); 
        
        if (birth == null && death == null) {
          ++seasons[season]['unknown'];
        } else if (death) {
          perfYear > death
            ? ++seasons[season]['dead']
            : (++seasons[season]['alive'], idx != 0 ? ++seasons[season]['repeatAlive'] : void 0);
        } else {
          ++seasons[season]['alive'];
          idx != 0 ? ++seasons[season]['repeatAlive'] : void 0; 
        }
        // quick + dirty way to grab whether a first performance or repeat
        idx === 0 ? ++seasons[season]['first'] : ++seasons[season]['repeat'];
        
      });
    });
  }); 
	
  totalWorksPerSeason = ALL_SEASONS.map(season => {
    let {first, repeat} = seasons[season], 
        total = first + repeat; 
    
    return {
      season: season,
      total: total, 
      first: first, 
      repeat: repeat
    };
  }); 
	
  const MAX_NUMBER_PER_SEASON = totalWorksPerSeason.reduce( (best, current) => {
    return best > current.total ? best : current.total; 
  }, 0); 
	
  //console.log(MAX_NUMBER_PER_SEASON)
	
  percentagesLivingDead = ALL_SEASONS.map(season => {
    let {unknown, alive, dead} = seasons[season], 
        total = unknown + alive + dead; 
    
    return {
      season: season, 
      total: total, 
      percentageAlive: alive/total, 
      percentageDead: dead/total
    };
  }); 
	
  percentagesFirstRepeat = ALL_SEASONS.map(season => {
    let {first, repeat} = seasons[season], 
        total = first + repeat; 
    
    return {
      season: season,
      total: total, 
      percentageFirst: first/total, 
      percentageRepeat: repeat/total
    };
    
  }); 
	
  percentagesOfRepeatsLiving = ALL_SEASONS.map(season => {
    let {repeatAlive, repeat} = seasons[season]; 
    
    //prevent dividing by 0
    repeat = repeat == 0 ? 1 : repeat; 
    
    return {
      season: season, 
      percentageOfRepeatsLiving: repeatAlive/repeat * 100 
    };
  }); 
  
  percentagesOfLivingRepeats = ALL_SEASONS.map(season => {
    let {repeatAlive, alive} = seasons[season]; 
    
    return {
      season: season, 
      percentageOfRepeatsLiving: repeatAlive/alive 
    };
  }); 
  
  percentagesOfAllRepeatsLiving = ALL_SEASONS.map(season => {
    let {repeatAlive, repeat, first} = seasons[season]; 
    
    total = repeat + first; 
    
    return {
      season: season, 
      percentageOfTotalRepeatsLiving: repeatAlive/total
      //percentageOfTotalRepeatsLiving: repeatAlive/total * 100 
    };
  }); 
	
  yAbs.domain([0, MAX_NUMBER_PER_SEASON]); 

  let stack = d3.stack().keys(['percentageAlive', 'percentageDead']); 	
	
  let stackA = d3.stack().keys(['percentageFirst', 'percentageRepeat']); 	
	
  let stackB = d3.stack().keys(['first', 'repeat']); 	
	
  let yAxisAbs = d3.axisLeft()
    .scale(yAbs)
    .tickSize(0);
  
  let yAxisPct = d3.axisLeft()
    .scale(yPct)
    .tickSize(0)
    .tickFormat( d => {
      return `${d*100}%`;  
    }); 
	
  let xAxisYear = d3.axisBottom()
    .scale(x)
    .tickValues(SVG_WIDTH < '480' ? [8, 58, 108, 158] : [8, 33, 58, 83, 108, 133, 158, 174])
    .tickFormat( d => {
      return ALL_SEASONS[d]; 
    })
    .tickSize(10); 
	
  //const ORG_TEXTS = ['New York Phil first-time performance', 'Repeat performances']; 

  //annotation experiment 
  const annotations = [{
    note: {
      title: '1909-10 Season', 
      label: 'Gustav Mahler\'s first season as music director was also marked by a 3X increase in the number of concerts, from 18 to 54',
      wrap: 180
    },
    //can use x, y directly instead of data
    data: { i: 67, workCount: 105 },
    dy: -80,
    dx: -90, 
  }]; 
	
  SVG.append('g')
    .attr('class', 'graph-content')
    .selectAll('.path')
    .data(stackB(totalWorksPerSeason))
    .enter().append('path')
    //Can also consolidate this with the scale; 
    .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
    .attr('d', areaAbsolute)
    .attr('fill', (d) => {
      if (d.key == 'first') return 'Tomato';
      if (d.key == 'repeat') return 'Steelblue';
    });
    //.each(function(data, i) {
    //  //annotations.push({
    //  //  note: {
    //  //    //title: "Hello performances"
    //  //    title: ORG_TEXTS[i]
    //  //  }, 
    //  //  data: { i: 165, workCount: (data[174][1] - data[174][0])/2 + data[174][0] }, 
    //  //  dy: -20,
    //  //  dx: SVG_WIDTH * .12
    //  //}); 
    //});
	
  //Add Y axis
  let yStreamAxis = SVG.append('g')
    .attr('class', 'yAxis axis stream-axis')
    //FIX THIS; relative instead of absolute number
    //.attr('transform', 'translate(10,0)') // a bit short to the left
    .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
    .call(yAxisAbs); 
  
  d3.select('.yAxis').select('.domain').remove(); 
	
  yStreamAxis.append('text')
    .attr('class', 'axis-label stream-label y-axis-label')
    .text('NUMBER OF UNIQUE COMPOSITIONS PER SEASON')
    .attr('transform', 'rotate(-90)')
    .attr('dy', -SVG_WIDTH*0.04)
    .attr('dx', '-15px');
	
  //Add X axis
  let xStreamAxis = SVG.append('g')
    .attr('class', 'xAxis axis stream-axis')
    .attr('transform', `translate(${0.05*SVG_WIDTH},${SVG_HEIGHT-3.9*PADDING})`)
    .attr('shape-rendering', 'geometricPrecision')
    .call(xAxisYear); 
	
  d3.select('.xAxis')
    .select('.domain')
    .remove(); 

  xStreamAxis
    .append('text')
    .attr('class', 'axis-label x-axis-label stream-label')
    .text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS')
    .attr('x', `${SVG_WIDTH*.95*.5}`)
    .attr('transform', `translate(0,${1.6*PADDING})`); 
	
  makeAnnotations.annotations(annotations); 
	
  SVG.append('g')
    .attr('class', 'annotation-group')
    .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
    .call(makeAnnotations); 
	
  let line = d3.line()
    .curve(d3.curveCardinal.tension(.1))
    .x((d, i) => x(i))
    .y(d => yPct(d.percentageOfTotalRepeatsLiving)); 
	
  let trendline = SVG.append('path').attr('class', 'trendline')
    .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
    .datum(movingAverage(percentagesOfAllRepeatsLiving, ['percentageOfTotalRepeatsLiving'], 7))
    //.enter()
    .attr('fill', 'none')
    .attr('stroke', 'rgb(218, 155, 103)')
    .attr('stroke-dasharray', '7, 2')
    .attr('d', d => line([{percentageOfTotalRepeatsLiving: 0}]))
    .style('stroke-width', '2px'); 
	
  transitionOrg = function() {
    currentGraph = 'abs'; 
    
    let temp = SVG.selectAll('path')
      .data(stackB(totalWorksPerSeason))
      .transition().duration(1400)
      .attr('d', areaAbsolute)
      .attr('fill', (d) => {
        if (d.key == 'first') return 'Tomato';
        if (d.key == 'repeat') return 'Steelblue';
      });
  
    
    SVG.select('.yAxis')
      .transition()
      .duration(1400)
      .call(yAxisAbs); 
    
    d3.select('.yAxis').select('.domain').remove(); 
    
    d3.select('.y-axis-label')
      .transition()
      .duration(1400)
      .text('NUMBER OF UNIQUE COMPOSITIONS PER SEASON'); 
    
    makeAnnotations.accessors({
      x: d => x(d.i),
      y: d => yAbs(d.workCount)
    }).annotations(annotations);
 
  }; 
	
	
  transition = function() {
    currentGraph = 'pct'; 

    //const TEXTS = ['Percentage of first-time performance', 'Percentage of repeat performances']; 
    let newAnnotations = [{
      note: {
        title: " "
      },
      data: { i: 0, perc: 0 }, 
      dy: 0,
      dx: 0
    }]; 

    makeAnnotations.accessors({
      x: d => x(d.i),
      y: d => yPct(d.perc)
    }).annotations(newAnnotations); 
    
    let stackData = stackA(percentagesFirstRepeat); 
    let newStuff = SVG.selectAll('path')
      .data(stackData); 
				
		
    newStuff.transition()
      .duration(1400)
      .attr('d', areaPercentage)
      .attr('fill', (d) => {
        if (d.key == 'percentageFirst') return 'Tomato';
        if (d.key == 'percentageRepeat') return 'Steelblue';
      });
      //.each(function(data, i) {
//
      //  //makeAnnotations.accessors({
  		//	//	x: d => x(d.i),
  		//	//	y: d => yPct(d.perc)
      //  //}); 
			////
      //  //newAnnotations.push({
      //  //  note: {
      //  //    //title: "Hello performances"
      //  //    title: TEXTS[i]
      //  //  }, 
      //  //  data: { i: 165, perc: (data[174][1] - data[174][0])/2 + data[174][0] }, 
      //  //  dy: -20,
      //  //  dx: SVG_WIDTH * .12
      //  //}); 
			//
      //  if (this == this.parentNode.lastChild) makeAnnotations.annotations(newAnnotations); 
			//				
      //}); 

    SVG.select('.yAxis')
      .transition()
      .duration(1400)
      .call(yAxisPct);
		
    d3.select('.yAxis').select('.domain').remove(); 

    d3.select('.y-axis-label').transition().duration(1400).text('PERCENTAGE OF UNIQUE PIECES PER SEASON');
		
  }; 
	
  transition2 = function() {
    currentGraph = 'pct'; 

    //const TEXTS = ['Percentage of first-time performance', 'Percentage of repeat performances']; 
    let newAnnotations = [{
      note: {
        title: " "
      },
      data: { i: 0, perc: 0 }, 
      dy: 0,
      dx: 0
    }]; 

    makeAnnotations.accessors({
      x: d => x(d.i),
      y: d => yPct(d.perc)
    }).annotations(newAnnotations); 
    
    let newStuff = SVG.selectAll('path')
      .data(stackA(movingAverage(percentagesFirstRepeat, ['percentageFirst', 'percentageRepeat'], 7))); 
		
    newStuff.transition()
      .duration(1400)
      .attr('d', areaPercentage)
      .attr('fill', (d) => {
        if (d.key == 'percentageFirst') return 'Tomato';
        if (d.key == 'percentageRepeat') return 'Steelblue';
      });
      //.each(function(data, i) {
      //  //fix this
      //  //console.log(this); 
      //  //console.log(this.parentNode);
      //  //console.log(this == this.parentNode.lastChild); 
      //  makeAnnotations.accessors({
  		//		x: d => x(d.i),
  		//		y: d => yPct(d.perc)
      //  }); 
			//
      //  //newAnnotations.push({
      //  //  note: {
      //  //    //title: "Hello performances"
      //  //    title: TEXTS[i]
      //  //  }, 
      //  //  data: { i: 165, perc: (data[174][1] - data[174][0])/2 + data[174][0] }, 
      //  //  dy: -20,
      //  //  dx: SVG_WIDTH * .12
      //  //}); 
			//
      //  if (this == this.parentNode.lastChild) makeAnnotations.annotations(newAnnotations); 
			//				
      //}); 

  }; 
	
  transition3 = function () {
    currentGraph = 'pct'; 

    //const MORE_TEXTS = ['Percentage of pieces by living composers', 'Percentage of pieces by deceased composers']; 
    let newAnnotations = [{
      note: {
        title: " "
      },
      data: { i: 0, perc: 0 }, 
      dy: 0,
      dx: 0
    }]; 
    
    makeAnnotations.accessors({
      x: d => x(d.i),
      y: d => yPct(d.perc)
    }).annotations(newAnnotations); 
    
    let newStuff = SVG.selectAll('path')
      //.data(stack(percentagesLivingDead)); 
      .data(stack(movingAverage(percentagesLivingDead, ['percentageAlive', 'percentageDead'], 7))); 
				
    newStuff.transition()
      .duration(1400)
      .attr('d', areaPercentage)
      .attr('fill', (d) => {
        if (d.key == 'percentageAlive') return '#ff645f';
        if (d.key == 'percentageDead') return '#7776bd';
      });
      //.each(function(data, i) {
			//				
      //  makeAnnotations.accessors({
  		//		x: d => x(d.i),
  		//		y: d => yPct(d.perc)
      //  }); 
			//
      //  //newAnnotations.push({
      //  //  note: {
      //  //    //title: "Hello performances"
      //  //    title: MORE_TEXTS[i]
      //  //  }, 
      //  //  data: { i: 165, perc: (data[174][1] - data[174][0])/2 + data[174][0] }, 
      //  //  dy: -20,
      //  //  dx: SVG_WIDTH * .12
      //  //}); 
			//
      //  if (this == this.parentNode.lastChild) makeAnnotations.annotations(newAnnotations); 
			//
      //}); 
  }; 
	
  transitionLine = function () {
    currentGraph = 'line'; 
    //const MORE_TEXTS = ['Percentage of pieces by living composers', 'Percentage of pieces by deceased composers']; 
    let startIndex = 0; 
		let newAnnotations = [{
      note: {
        //title: "Hello performances"
        title: 'Percentage of pieces that are repeat performances of music by a living composer', 
        wrap: 155
      }, 
      data: { i: 45, perc: percentagesOfAllRepeatsLiving[79].percentageOfTotalRepeatsLiving }, 
      dy: -135,
      dx: 105
    }]; 

    animateLine = d3.timer(function() {
      if (startIndex >= 175) {
        animateLine.stop();
        makeAnnotations.annotations(newAnnotations); 
      } else {
        startIndex += 1;  
        trendline.attr('d', d => line(d.slice(0, startIndex)));
      }
    });
		
		
    d3.select('.graph-content')
      .selectAll('path');
					
  }; 
	
  transitionLineExit = function () {
		
    if (animateLine) animateLine.stop(); 
		
    trendline.attr('d', d => line([{percentageOfTotalRepeatsLiving: 0}]));
    
    let newAnnotations = [{
      note: {
        title: " "
      },
      data: { i: 0, perc: 0 }, 
      dy: 0,
      dx: 0
    }]; 
    
    makeAnnotations.annotations(newAnnotations); 
    
    //TODO Annotations to trendline is repainted/removed with a delay (concominant with transition3) and this is not good UX
  };
	
	

  let prose0 = new ScrollMagic.Scene({
    triggerElement: '.explain1', 
    duration: 500, 
    triggerHook: .5
  })
    .addTo(controller);
	
  let prose1 = new ScrollMagic.Scene({
    triggerElement: '.explain2', 
    duration: 500, 
    triggerHook: .5
  })
    .addTo(controller);
	
  let prose2 = new ScrollMagic.Scene({
    triggerElement: '.explain3', 
    //duration: 500, 
    triggerHook: .5
  })
    .addTo(controller);
	
  let prose3 = new ScrollMagic.Scene({
    triggerElement: '.explain4', 
    duration: 500, 
    triggerHook: .5
  })
    .addTo(controller);
	
  let prose4 = new ScrollMagic.Scene({
    triggerElement: '.explain5', 
    duration: 500, 
    triggerHook: .5
  })
    .addTo(controller);

	
  prose0.on('enter', () => {
    //console.log("first"); 
    $('.explain1').addClass('focus');
    transitionOrg(); 
  }); 
  
  prose0.on('leave', () => {
    //console.log("first"); 
    $('.explain1').removeClass('focus');
  }); 

  prose1.on('enter', () => {
    $('.explain2').addClass('focus');
    transition(); 
  }); 
  
  prose1.on('leave', () => {
    //console.log("first"); 
    $('.explain2').removeClass('focus');
  }); 
	
  prose2.on('enter', () => {
    //console.log("third"); 
    transition2(); 
  }); 
	
  prose3.on('enter', () => {
    //console.log("fourth"); 
    transition3(); 
  }); 
	
  prose3.on('leave', (e) => {
    //console.log("fourth"); 
    if (e.scrollDirection === 'REVERSE') transition2(); 
  }); 
	
  prose4.on('enter', (e) => {
    console.log('LAST'); 
    if (e.scrollDirection === 'FORWARD') transitionLine(); 
  }); 
	
  prose4.on('leave', (e) => {
    if (e.scrollDirection === 'REVERSE') transitionLineExit(); 	
  }); 

	
  function resize() {
    //update scales
    let windowWidth = $(window).innerWidth(); 
    let areaGen = {}; 
    SVG_HEIGHT = $(window).innerHeight() * .9; 
    SVG_WIDTH = $('.container').innerWidth(); 
    SVG.attr('width', SVG_WIDTH) 
      .attr('height', SVG_HEIGHT); 
    x.range([0, .92 * SVG_WIDTH]);
    yAbs.range([SVG_HEIGHT-4*PADDING, 10]);
    yPct.range([SVG_HEIGHT-4*PADDING, 10]); 
		
    $('#first-explain').css('margin-top', $(window).innerHeight()/2); 

    $('.explain p').css('margin-bottom', function() {
      return this.id !== 'last-explain' ? $(window).innerHeight() : 0; 
    }); 

    
    scene.duration(document.querySelector('.outer-container').offsetHeight - window.innerHeight);

    //let yAxisAbs = d3.axisLeft()
    //  .scale(yAbs)
    //  .tickSize(0);
  //
    //let yAxisPct = d3.axisLeft()
    //  .scale(yPct)
    //  .tickSize(0)
    //  .tickFormat( d => {
    //    return `${d*100}%`;  
    //  }); 
	
    xAxisYear = d3.axisBottom()
      .scale(x)
      .tickValues(windowWidth < 500 ? [8, 58, 108, 158] : [8, 33, 58, 83, 108, 133, 158, 174])
      .tickFormat( d => {
        return ALL_SEASONS[d]; 
      })
      .tickSize(10); 
    
    SVG.select('.xAxis')
      .transition()
      .duration(500)
      .attr('transform', `translate(${0.05*SVG_WIDTH},${SVG_HEIGHT-3.9*PADDING})`)
      .call(xAxisYear); 
    SVG.select('.xAxis').select('.domain').remove(); 
    SVG.select('.x-axis-label').attr('x', `${SVG_WIDTH*.95*.5}`);

    //xStreamAxis
    //.append('text')
    //.attr('class', 'axis-label x-axis-label stream-label')
    //.text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS')
    //.attr('x', `${SVG_WIDTH*.95*.5}`);
    
    if (currentGraph === 'abs') {
      areaGen.area = areaAbsolute; 
      areaGen.axis = yAxisAbs; 
    } else {
      areaGen.area = areaPercentage; 
      areaGen.axis = yAxisPct; 
    }
    
    SVG.select('.graph-content')
      .selectAll('path')
      .transition()
      .duration(500)
      .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
      .attr('d', areaGen.area)
      .on('end', () => {
        if (currentGraph === 'line') {
          let startIndex = 0; 
          if (animateLine) animateLine.stop(); 
          animateLine = d3.timer(function() {
            if (startIndex >= 175) {
              animateLine.stop();
              //makeAnnotations.annotations(annotations3); 
            } else {
              startIndex += 1;  
              d3.select('.trendline')
                .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
                .attr('d', d => line(d.slice(0, startIndex)));
            }
          });
        } else {
          SVG.select('.trendline').attr('d', d => line([{percentageOfTotalRepeatsLiving: 0}]));
        }
      }); 
    SVG.select('.yAxis')
      .attr('transform', `translate(${0.05*SVG_WIDTH},0)`)
      .call(areaGen.axis); 
		
    SVG.select('.yAxis').select('.domain').remove(); 
		
    //console.log('resized'); 
    SVG.select('g.annotation-group').call(makeAnnotations); 
    makeAnnotations.updatedAccessors(); 

  }

  window.addEventListener('resize', debounce(resize, 200)); 
	
}); 

let controller = new ScrollMagic.Controller();

let containerScroll = document.querySelector('.outer-container'); 

let scene = new ScrollMagic.Scene({
  triggerElement: '.outer-container', 
  duration: containerScroll.offsetHeight - window.innerHeight, 
  triggerHook: 0
}).addTo(controller);

scene.on('enter', () => {
  console.log('fixed'); 
  $('.inner-container').addClass('fixed'); 
});  
	
scene.on('leave', (e) => {
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