(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
let generateSeasons = require('../../temp_utils/generate_seasons.js');
let isMobile = require('../../temp_utils/is-mobile.js');
let debounce = require('just-debounce-it'); 


const ALL_SEASONS = generateSeasons(1842, 2016); 


function any (array, func) {
  let bool = false; 
  for (let i=0; i<array.length; i++) {
    if (func(array[i])) bool = true; 
  }
  return bool; 
}
//Incomplete; need to finish and move to utilities folder
function formatComposerName (name) {
  let names = name.split(','); 
  console.log(names);
  let match; 
  //.split(' ').filter(el => !!el).join(' ')  
  // hackish way to remove spaces
  let firstname = names[1].trim().split(' ').filter(el => !!el).join(' '); 
  let surname = (match = names[0].match(/\[.*\]/)) ? match[0].substr(1, match[0].length - 2) : names[0]; 
  return names.length === 3 ? `${firstname} ${surname} II`.trim() : `${firstname} ${surname}`.trim(); 
}

let svgDimensions; 

let composerWorks = []; 
let currentType; 

//Github pages bug
//d3.json('/NYPhil_data_viz/data/new_top60.json', composers => {
//DEV
d3.json('../../data/new_top60.json', composers => {
//experiment with all composers
//d3.json('../../data/composers.json', composers => {

  console.log(composers);
  composers.forEach(composer => {
    if (composer.death > 1842) {
      if (!any(composer.works, (work) => parseInt(work.seasons[0]) < composer.death)) {
        console.log('after death: ' + composer.composer); 
      } else {
        //console.log('before death: ' + composer.composer);
      }
      
    }
    if (composer.death <= 1842) console.log(composer.composer);
    
  });
  let SVG_WIDTH = $('.main-container').innerWidth(); 
	let SVG_HEIGHT = $(window).innerHeight()*.75; //REDO and calculate as innerHeight - (title + dropdown)
	//console.log(SVG_WIDTH);
	//console.log(SVG_HEIGHT); 
	
  //Heatmap color values (use samples[3])
  let samples = [[27, 243, 6, 128, 94, 52], [89, 248, 15, 182, 15, 7], [94, 207, 34, 195, 175, 46], [89, 207, 15, 195, 15, 46]]; 

  let currentComposer; 
  
  //scales for DOT CHART
	let seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([SVG_WIDTH*.05, SVG_WIDTH*.95]); 
	let yScale = d3.scaleLinear().domain([0,31]).range([SVG_HEIGHT*.92, 0]);
	
  //Begin Voronoi tests; voronoi generator/accessors
  let voronoiGen = d3.voronoi()
    .x(d => seasonsScale(d.season))
    .y(d => yScale(d.seasonWorkCount)); 
  
  let svg = d3.select('.main-container').append('svg').attr('class', 'composers-chart-container'); 
  
  svg.attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT); 
	
	//Axes logic and display 
	svgDimensions = document.getElementsByTagName('svg')[0].getBoundingClientRect(); 
	let axisYears = d3.axisBottom(seasonsScale)
										.tickValues(seasonsScale.domain().filter((season, i) => {
											const S = ["1842-43", "1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01", "2016-17"];
											return S.includes(season); 
										})) 
										.tickSize(SVG_HEIGHT*.92); 
                    //.tickFormat(d => d === "1842-43" ? "1842" : d); 
	
	let axisFreq = d3.axisLeft(yScale)
										.ticks(5)
										.tickSize(SVG_WIDTH*.009); 
			
  //Global SVG DOM elements
  let dotXAxis; 
  let dotFreqAxis; 
  
  //Dot chart contents
  //Lifetime box
  let lifetime;// = svg.append('g').attr('class', 'lifetime-box'); 
  //Dots grouping
  let dots; // = svg.append('g').attr('class', 'dots-grouping');
  //Voronoi grouping
  let voronoiOverlay; // = svg.append('g').attr('class', 'voronoi-overlay'); 
  
  ////Lifetime box
  //let lifetime = svg.append('g').attr('class', 'lifetime-box'); 
  ////Dots grouping
  //let dots = svg.append('g').attr('class', 'dots-grouping');
  ////Voronoi grouping
  //let voronoiOverlay = svg.append('g').attr('class', 'voronoi-overlay'); 
  
  //Heatmap container 
  let heatmapContainer;// = svg.append('g').attr('class', 'heatmapPow'); 
  let grid;// = heatmapContainer.append('g').attr('class', 'grid'); 
  let texts; //= svg.append('g').attr('class', 'grid-labels'); 
  
  //let seasonsLabels = [{row: 0, season: "1842-59"}, {row: 2, season: "1880-99"}, {row: 4, season: "1920-39"}, {row: 6, season: "1960-79"}, {row: 8, season: "2000-17"}]
  //  
  //let gridLabels = texts.selectAll('texts').data(seasonsLabels).enter().append('text'); 

  //Heatmap Scales
  let scaleCol = d3.scaleLinear().domain([0,20]).range([0, SVG_WIDTH*.8]), 
      gridCellWidth = scaleCol(1);     
  
    
	//Event listeners when option is selected from dropdown
	$('.select-value').on('change', function(e) {
		let index = this.value; 
    renderComposer(index); 
	});
  
  function setupDotChart() {
    //Add X axis
    dotXAxis = svg.append('g')
      .attr('class', 'axis axis-years')
      .attr('transform',`translate(${-seasonsScale.bandwidth()/2.4},0)`)
		  .call(axisYears); 
	
    dotXAxis.select('.domain').remove(); 
    dotXAxis.selectAll('.tick line')
      .style('stroke', 'White')
      .style('stroke-dasharray', '8,3');
    dotXAxis.selectAll('text')
      .style("text-anchor", d => (d === '1842-43' || d === '2016-17') ? "middle" : "start");
  
    dotXAxis.selectAll('.tick text')
      .attr('transform', `translate(0,${SVG_HEIGHT*.015})`); 
    dotXAxis.append('text')
      .attr('class', 'axis-label x-axis-label')
      .text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS')
      .attr('text-anchor', 'middle')
      .attr('x',SVG_WIDTH*.5)
      .attr('transform', `translate(0,${SVG_HEIGHT*.995})`); 
  
    //Add Y Axis
    dotFreqAxis = svg.append('g')
      .attr('class', 'axis axis-freq')
      .attr('transform', `translate(${SVG_WIDTH*.05},0)`)
      .call(axisFreq); 
  
    dotFreqAxis.select('.domain').remove(); 
    dotFreqAxis.append('text')
      .attr('class', 'axis-label')
      .text('NUMBER OF COMPOSITIONS PER SEASON')
  		.attr("transform", "rotate(-90)")
  		//.attr('dx', -SVG_HEIGHT/2.5)
  		.attr('dy', -SVG_WIDTH*0.03); 
  
    dotFreqAxis.selectAll(".tick").select("line")
		  .attr("stroke", "White")
		  .attr("stroke-dasharray", "2,2"); 

    
    //Lifetime box setup
    let rectX = seasonsScale("1842-43"); 
    let rectWidth = 0; 
  
    lifetime = svg.append('g').attr('class', 'lifetime-box'); 
    
    lifetime.append('rect')
      .attr('x', rectX)
      .attr('y', 0)
      .attr('width', rectWidth)
      .attr('height', SVG_HEIGHT*.92)
      .attr('opacity', .3)
      .attr('fill', 'grey'); 
	
    ////LINE ABOVE LIFETIME BOX
    lifetime.append('line')
      .attr('x1', rectX)
      .attr('x2', rectX + rectWidth)
      .attr('y1', 0)
      .attr('y2', 0)
      .attr('stroke', '#ff645f')
      .attr('stroke-width', '10');
    
    ////Dots grouping
    dots = svg.append('g').attr('class', 'dots-grouping');
    
    ////Voronoi grouping
    voronoiOverlay = svg.append('g').attr('class', 'voronoi-overlay'); 
    
    //Tooltip setup
    d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0); 

  }
  
  //Create Options for select elements populated with composer names
	composers.forEach( (composer, idx) => {
		let option = `<option value='${idx}'>${formatComposerName(composer.composer)}</option>`; 
		$('.select-value').append(option); 
	}); 
  
  
  
  $('.dot-chart-prelude').on('click', (e) => {
    let index = e.target.dataset.index; 
    //Feature detection here
    //let chromeOrFirefox = navigator.userAgent.match(/Chrome\/\d*|Firefox\/\d*/);
    //let browserVersion = chromeOrFirefox[0].match(/\d+/)[0]; 
    //let options = null; 
    //
    //console.log(browserVersion);
    
    if (e.target.dataset.index) {
      document.querySelector('.dot-chart .graphic-title').scrollIntoView(); 
      selectComposer(index);
    } 
  });
	
	//Reset dots 
	$('#dot-chart').on('click', function(e) {
		let index = $('.select-value').val() || 0; 
		//THIS APPROACH IS PROBABLY WASTEFUL PERFORMANCE-WISE; redo without calling so much extra code 
    //CAUSING BUGSSSSS ARGH
		if (e.target.tagName !== 'path' && !isMobile().any() && window.matchMedia("(min-width: 900px)").matches) {
      renderDots(index); 
    } 
	}); 
	
  //  let lifetime = svg.append('g').attr('class', 'lifetime-box'); 
  ////Dots grouping
  //let dots = svg.append('g').attr('class', 'dots-grouping');
  ////Voronoi grouping
  //let voronoiOverlay = svg.append('g').attr('class', 'voronoi-overlay'); 
  

	function resize() {
    //Reset dimensions + scales
    //Dimensions
    SVG_WIDTH = $('.main-container').innerWidth(); 
    SVG_HEIGHT = $(window).innerHeight()*.75; //REDO and calculate as innerHeight - (title + dropdown)

    //reset svg
    svg.attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT); 
	
    //TODO reset tooltip box
    svgDimensions = document.getElementsByTagName('svg')[0].getBoundingClientRect(); 
    //Scales
    //let seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([SVG_WIDTH*.05, SVG_WIDTH*.95]); 
	  //let yScale = d3.scaleLinear().domain([0,31]).range([SVG_HEIGHT*.92, 0]);
    seasonsScale.range([SVG_WIDTH*.05, SVG_WIDTH*.95]); 
    yScale.range([SVG_HEIGHT*.92, 0]);
    voronoiGen
      .x(d => seasonsScale(d.season))
      .y(d => yScale(d.seasonWorkCount))
      .extent([[seasonsScale(composerWorks[0].season) - 7, yScale(d3.max(composerWorks, work => work.seasonWorkCount)) - 7], [seasonsScale(composerWorks[composerWorks.length - 1].season) + 7, SVG_HEIGHT*.92]]);

    axisYears = d3.axisBottom(seasonsScale)
      .tickSize(SVG_HEIGHT*.92)
      .tickValues(seasonsScale.domain().filter((season, i) => {
		  	const S = ["1842-43", "1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01", "2016-17"];
		  	return S.includes(season); 
		  })) ; 
    
    axisFreq = d3.axisLeft(yScale)
      .ticks(5)
      .tickSize(SVG_WIDTH*.009); 
    
    //redraw axes
    let dotXAxis = svg.select('.axis-years')
      .attr('transform',`translate(${-seasonsScale.bandwidth()/2.4},0)`)
		  .call(axisYears); 
    
    dotXAxis.select('.domain').remove(); 
    dotXAxis.selectAll('.tick line')
      .style('stroke', 'White')
      .style('stroke-dasharray', '8,3');
    dotXAxis.selectAll('text')
      .style("text-anchor", d => (d === '1842-43' || d === '2016-17') ? "middle" : "start");
    
    dotXAxis.select('.x-axis-label')
      .style('text-anchor', 'middle')
      .attr('x', SVG_WIDTH*.5)
      .attr('transform', `translate(0,${SVG_HEIGHT*.995})`); 

    let dotFreqAxis = svg.select('.axis-freq')
      .attr('transform', `translate(${SVG_WIDTH*.05},0)`)
      .call(axisFreq); 
  
    dotFreqAxis.select('.domain').remove(); 
  
    dotFreqAxis.selectAll(".tick").select("line")
		  .attr("stroke", "White")
		  .attr("stroke-dasharray", "2,2"); 
    
    //redraw dots
    let dots = svg.select('.dots-grouping').selectAll('circle'); 
    dots.transition().duration(500).attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', d => yScale(d.seasonWorkCount)); 
    
    //redraw voronoi overlay
    voronoiOverlay.selectAll('path')
      .data(voronoiGen.polygons(composerWorks))
      .transition()
      .duration(500)
      .attr('d', d => "M" + d.join("L") + "Z"); 

    //redraw lifetime box
    lifetime.select('rect').transition().duration(500)
      .attr('x', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        console.log(seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"))
        return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
      })
		  .attr('width', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
        let deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.death) )]; 
        let rectWidth; 

        if (!seasonsScale(deathSeason)) {
          rectWidth = 0; 
		    } else {
          rectWidth = seasonsScale(deathSeason) - rectX; 
		    }
        return rectWidth; 
      })
      .attr('height', SVG_HEIGHT*.92); 
    
    lifetime.select('line').transition().duration(500)
      .attr('x1', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
      })
      .attr('x2', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        let deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.death) )]; 
        let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
        let rectWidth; 

        if (!seasonsScale(deathSeason)) {
          rectWidth = 0; 
		    } else {
          rectWidth = seasonsScale(deathSeason) - rectX; 
		    }

        return (seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43")) + rectWidth; 
      }); 
    
    
  }
  
  function mobileResize() {}
  
  window.addEventListener('resize', debounce(resizeDelegation, 200)); 

  function resizeDelegation() {
    let type; 
    if (!isMobile().any() && window.matchMedia("(min-width: 900px)").matches) {
      type = 'dots'; 
    } else {
      type = 'heat'; 
    }
    
    console.log(currentType, type);
    if (currentType === type) {
      console.log('true'); 
      currentType === "dots" ? resize() : mobileResize(); 
    } else {
      console.log('false');
      if (currentType === "dots") {
        //check if heatmap has been initialized, if not, do so. 
        
        //Hide Dots
        (svg.select('.lifetime-box').classed('hidden', true), svg.select('.dots-grouping').classed('hidden', true),
        svg.select('.voronoi-overlay').classed('hidden', true), svg.selectAll('.axis').classed('hidden', true)); 
        //Show Heat Map
        
      } else {
        //check if dot chart has been initialized, if not, do so. 
        
        //Hide Heat map
        
        //Show Dots
        (svg.select('.lifetime-box').classed('hidden', false), svg.select('.dots-grouping').classed('hidden', false),
        svg.select('.voronoi-overlay').classed('hidden', false), svg.selectAll('.axis').classed('hidden', false)); 
      } 
      //update current chart type
      currentType = type; 
    }
  }
    
    
  
  
  
  function matchComposers(params, data) {
    // If there are no search terms, return all of the data
    let altNames = [{name: 'antonin dvorak', id: 14}, {name: 'camille saint-saens', id: 22}, {name: 'bela bartok', id: 23}, {name: 'cesar franck', id: 33}, {name: 'frederic chopin', id: 34}, {name: 'peter ilich tchaikovsky', id: 3}, {name: 'sergey rachmaninov', id: 21}, {name: 'modest mussorgsky', id: 35}, {name: 'sergey prokofieff', id: 18}];
    
    if ($.trim(params.term) === '') {
      return data;
    }
    
    for (let i = 0; i < altNames.length; i++) {
      if (altNames[i].name.match(params.term.toLowerCase().trim()) && data.id == altNames[i].id) {
        return data; 
      }
    }
         
    if (data.text.toLowerCase().indexOf(params.term.toLowerCase().trim()) > -1) {
      return data; 
    }
    
    // Return `null` if the term should not be displayed
    return null;
  }
  //Create Select2 object
  //$('.select-value').select2(); 
  $('.select-value').select2({matcher: matchComposers}); 

  //function expects composer object
  //UGLY CODE. Does side-effects + and returns data. Refactor ASAP
  function calculateComposerSeasonData (composer, composerIndex) {
    let seasonsCount = []; 
    
    composerWorks = []; 
		ALL_SEASONS.forEach( (season, season_idx) => {
			let works = composer.works; 
      //accumulates the # of pieces per season by one composer
			let seasonWorkCount = 0; 
			works.forEach( (work, work_idx) => {
				let workSeasons = work.seasons; 
				let numOfPerformances = workSeasons.length; 

				if (workSeasons.includes(season)) {
					let workMetaData = {
            id: `${composerIndex}:${work_idx}`, 
            title: work.title, 
            season: season,
            seasonWorkCount: ++seasonWorkCount, 
            seasonCount: work.seasonCount, 
            numOfPerfs: numOfPerformances, 
            composer: work.composer
          }; 
					if (workSeasons.length === 1) {
						workMetaData["orphanWork"] = true; 
					} else if (workSeasons.indexOf(season) === 0) {
						workMetaData["firstPerf"] = true; 
					} 
					composerWorks.push(workMetaData); 
					//seasonWorkCount++; 
				}
				
			});
		  //seasonsCount.push({count: seasonWorkCount === 0 ? 0 : seasonWorkCount, season: season});
      seasonsCount.push({count: seasonWorkCount, season: season});

		}); 
		
		console.log(composerWorks.length);
    console.log(seasonsCount);
    return seasonsCount; 
  }
  
  /* HEAT MAP EXPERIMENT */
  function calculateGrid(data, cellsPerRow, startColumnIndex = 0) {
    let dataLength = data.length - 1; 
    let lastColIndex = cellsPerRow - 1; 
    let rowCurrent = 0; 
    let colCurrent = startColumnIndex;
    let newData = []; 
    
    for (let i = 0; i <= dataLength; i++) {
      newData.push(Object.assign(data[i], {rowIndex: rowCurrent, colIndex: colCurrent})); 
      if (colCurrent == lastColIndex) {
        colCurrent = 0; 
        rowCurrent += 1; 
      } else {
        colCurrent += 1; 
      }
    }
    
    return newData; 
    
  }
  
  function setupHeatMap () {
    heatmapContainer = svg.append('g').attr('class', 'heatmapPow'); 
    grid = heatmapContainer.append('g').attr('class', 'grid'); 
    texts = svg.append('g').attr('class', 'grid-labels'); 
  
    let seasonsLabels = [{row: 0, season: "1842-59"}, {row: 2, season: "1880-99"}, {row: 4, season: "1920-39"}, {row: 6, season: "1960-79"}, {row: 8, season: "2000-17"}]
      
    let gridLabels = texts.selectAll('texts').data(seasonsLabels).enter().append('text'); 
    heatmapContainer.attr('height', SVG_HEIGHT * .7)
      .attr('width', SVG_WIDTH); 
    
    grid.attr('transform', `translate(${SVG_WIDTH*.2}, 0)`); 
    
    gridLabels.attr('x', SVG_WIDTH * .035)
      .attr('y', d => d.row * gridCellWidth)
      .attr('transform', `translate(0, ${gridCellWidth/1.5})`)
      .text(d => d.season); 
    
  }
  
  function renderHeatMap(data, a, b, c, d, e, f) {
    let scaleBP = d3.scalePow().exponent(.55).domain([1, 31]).range([a, b]), 
        scaleGP = d3.scalePow().exponent(.65).domain([1, 31]).range([c, d]), 
        scaleRP = d3.scalePow().exponent(.5).domain([1, 31]).range([e, f]); 
    
    let rects = grid
      .selectAll('rect'); 
    
    rects.data(data).transition()
      .duration(1400)
      //.attr('fill', d => scaleColor(d.count)); 
      .attr('fill', d => {
        let r, g, b; 
        r = Math.floor(scaleRP(d.count)); 
        g = Math.floor(scaleGP(d.count)); 
        b = Math.floor(scaleBP(d.count)); 
        
        return d.count == 0 ? 'rgba(30,30,30,.45)' : `rgba(${r}, ${g}, ${b}, 1)`; 
      }); 
    
    
    rects.data(data)
      .enter()
      .append('rect')
      //.attr('x', (d, i) => scaleXAxis(i))
      .attr('x', d => scaleCol(d.colIndex))
      .attr('y', d => d.rowIndex * gridCellWidth)
      .attr('width', gridCellWidth)
      .attr('height', gridCellWidth)
      .attr('fill', 'rgba(1,1,1,0)')
      .transition()
      .duration(1400)
      //.attr('fill', d => scaleColor(d.count)); 
      .attr('fill', d => {
        let r, g, b; 
        r = Math.floor(scaleRP(d.count)); 
        g = Math.floor(scaleGP(d.count)); 
        b = Math.floor(scaleBP(d.count)); 
        
        return d.count == 0 ? 'rgba(30,30,30,.45)' : `rgba(${r}, ${g}, ${b}, 1)`; 
      }); 
    
  }

  /* END HEAT MAP */
  
  
  function selectComposer(index) {
    //Code for vanilla select element
    //document.querySelector('.select-value').value = index;
    //Code for using Select2 control
    $('.select-value').val(index);
    $('.select-value').trigger('change');
    
    renderComposer(index);
  }

  
  function renderComposer(index) {
    //$('option').attr('selected', false); 
    //$(`.select-value option[value=${index}]`).attr('selected', true);
    
    console.log(`composer selected: ${index}: ${composers[index].composer}`);
    $('.composer-face').remove(); 
    let composer = composers[index].composer; 
		let composerImage = composer === 'Strauss,  Johann, II'
												? 'strauss_j.png' 
												: composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
		$('.composer-face-container').append(`<img class='composer-face' src='assets/images/composer_sqs/${composerImage}'/>`); 
    if (currentType == 'dots') {
      renderDots(index); 
    } else {
      renderHeatMap.call(null, calculateGrid(calculateComposerSeasonData(composers[index], index), 20, 2), ...samples[3]);
    }
  }
	
	function renderDots(number) {
		let composer = composers[number]; 
    let composerWrapper = [composer]; 
		let composerIndex = number; 
		let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(composer.birth) )]; 
		let deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(composer.death) )]; 

    //let rectX = seasonsScale("1842-43"); 
    //let rectWidth = 0; 
  
		//let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
//
		//let rectWidth; 
		//
		//if (!seasonsScale(deathSeason)) {
		//	rectWidth = 0; 
		//} else {
		//	rectWidth = seasonsScale(deathSeason) - rectX; 
		//}
		
    calculateComposerSeasonData(composer, composerIndex);

		// Composer birth-death box transition
    let lifetimeBox = lifetime.select('rect').data(composerWrapper); 
    let lifetimeBoxLine = lifetime.select('line').data(composerWrapper); 
    console.log(lifetimeBox);
    
    //lifetimeBox.exit().remove(); 
    
    lifetimeBox.transition().duration(1400)
      .attr('x', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        console.log(seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"))
        return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
      })
		  .attr('width', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
        let deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.death) )]; 
        let rectWidth; 

        if (!seasonsScale(deathSeason)) {
          rectWidth = 0; 
		    } else {
          rectWidth = seasonsScale(deathSeason) - rectX; 
		    }
        return rectWidth; 
      }); 
    
    lifetimeBoxLine.transition().duration(1400)
      .attr('x1', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
      })
      .attr('x2', d => {
        let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.birth) )]; 
        let deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(d.death) )]; 
        let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
        let rectWidth; 

        if (!seasonsScale(deathSeason)) {
          rectWidth = 0; 
		    } else {
          rectWidth = seasonsScale(deathSeason) - rectX; 
		    }

        return (seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43")) + rectWidth; 
      }); 
   
    
		
      //.attr('x1', rectX)
      //.attr('x2', rectX + rectWidth); 
		
		let dots = svg.select('.dots-grouping').selectAll('circle')
			.data(composerWorks); 
		
		dots.exit().remove(); 
		
		dots.transition().duration(1400)
			.attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', d => yScale(d.seasonWorkCount))
			.attr('fill', d => {
				if (d.orphanWork) return '#343434'; 
				if (d.firstPerf) return 'Tomato'; 
				else return '#3f74a1'; 
			})
			.attr('stroke', d => {
				if (d.orphanWork) return '#df644e'; 
			})
			.attr('opacity', 1)
			.attr('stroke-width', 1)
			.attr('r', seasonsScale.bandwidth()/2.4)
      .attr('class', (d, i) => `piece unid-${i}`);

		
		dots.enter().append('circle').attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', SVG_HEIGHT + 5)
			.attr('class', (d, i) => `piece unid-${i}`)
      .transition().duration(1400)	
			.attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', d => yScale(d.seasonWorkCount))
			.attr('fill', d => {
				if (d.orphanWork) return '#343434'; 
				if (d.firstPerf) return 'Tomato'; 
				else return '#3f74a1';
			})
			.attr('stroke', d => {
				if (d.orphanWork) return '#df644e'; 
			}); 
	
    console.log(composerWorks); 
    
    
    //Voronoi inside renderDots; needs calculateComposerSeasonData to have been called
    voronoiOverlay.selectAll('path').remove(); 
    
    //min X seasonsScale(composerWorks[0].season) - 20
    //max X seasonsScale(composerWorks[composerWorks.length - 1].season) + 20
    //min Y SVG_HEIGHT*.92
    //max Y yScale(d3.max(composerWorks, work => work.seasonWorkCount))
    //TODO calculate new extents depending on composer
    //OLD: voronoiGen.extent([[SVG_WIDTH*.05, 0], [SVG_WIDTH*.95, SVG_HEIGHT*.92]]);
    voronoiGen.extent([[seasonsScale(composerWorks[0].season) - 7, yScale(d3.max(composerWorks, work => work.seasonWorkCount)) - 7], [seasonsScale(composerWorks[composerWorks.length - 1].season) + 7, SVG_HEIGHT*.92]]);

    voronoiOverlay.selectAll('path').data(voronoiGen.polygons(composerWorks)).enter()
      .append('path')
      .attr('d', d => "M" + d.join("L") + "Z") 
      .attr('class', (d, i) => `piece unid-${i}`)
      .on('click', (d, i) => {
				let id = d.data.id; 

				d3.selectAll('.piece').attr('stroke', d => {
					if (d.id == id) return 'white'; 
				}).attr('opacity', d => {
					if (d.id != id) return 0.4; 
					else return 1; 
				})
				.attr('r', seasonsScale.bandwidth()/2.4)					
				.attr('stroke-width', 1); 

				d3.select(`circle.unid-${i}`)
					.attr('stroke-width', 3)
					.attr('r', seasonsScale.bandwidth()/1.5); 
			})
      .on('mouseover', (d, i) => {
        let data = d.data; 
        let dimensions = document.querySelector(`circle.unid-${i}`).getBoundingClientRect(); 

				let left = dimensions.right > svgDimensions.left + svgDimensions.width/2 
												? dimensions.right - 370
												: dimensions.right + 20; 
				let tooltip = d3.select('.tooltip').style('left', left + "px"); 
				//will be variable based on the text content
        let height; 
        let id = `unid-${i}`;
        let html = `<span class='tooltip-title'>${data.title}</span><br><span class='tooltip-content'><em>${data.season} season</em></span><br><span class='tooltip-content'>Appeared in ${data.seasonCount} ${data.seasonCount == 1 ? 'season' : 'seasons'}</span><br><span class='tooltip-content'>${((data.numOfPerfs/composerWorks.length)*100).toFixed(2)}% of all performances of works by ${data.composer}</span>`; 
				tooltip.html(html); 
        //vertically center tooltip with the dot
				height = document.querySelector('.tooltip').getBoundingClientRect().height; 
				tooltip.style('top', (dimensions.top - Math.floor(height/1.5)) + "px"); 
				tooltip.transition().duration(500).style('opacity', .9); 
				//d3.select(d3.event.target)
				//	.attr('stroke-width', 3)
				//	.attr('r', seasonsScale.bandwidth()/1.5); 
        d3.select(`circle.unid-${i}`)
	       .attr('stroke-width', 3)
	       .attr('r', seasonsScale.bandwidth()/1.5); 
			})
      .on('mouseout', (d, i) => {
	      let tooltip = d3.select('.tooltip'); 
	      tooltip.transition().duration(300).style('opacity', 0); 
	      d3.select(`circle.unid-${i}`)
	      	.attr('stroke-width', 1)
	      	.attr('r', seasonsScale.bandwidth()/2.4); 
      })
      //To see voronoi outline/dev env; comment out in production 
      //.style("stroke", "rgba(180, 180, 180, .5)")
      .style('pointer-events', 'all')
      .style('fill', 'none');
	}
	
  if (!isMobile().any() && window.matchMedia("(min-width: 900px)").matches) {
    currentType = 'dots'; 
    setupDotChart(); 
  } else {
    currentType = 'heat'; 
    setupHeatMap(); 
  }
  
  selectComposer(0);

}); 




},{"../../temp_utils/generate_seasons.js":3,"../../temp_utils/is-mobile.js":4,"just-debounce-it":2}],2:[function(require,module,exports){
module.exports = debounce;

function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    if (!wait) {
      return func.apply(this, arguments);
    }
    var context = this;
    var args = arguments;
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      timeout = null;
      if (!callNow) {
        func.apply(context, args);
      }
    }, wait);

    if (callNow) {
      return func.apply(this, arguments);
    }
  };
};

},{}],3:[function(require,module,exports){
function generateSeasons (start, end) {
	let seasons = []; 
	
	for (let i = start; i <= end; i++) {
		let nextSeas = String(i + 1).slice(2, 4);
		seasons.push(String(`${i}-${nextSeas}`)); 
	}
	
	return seasons; 
}

module.exports = generateSeasons; 
},{}],4:[function(require,module,exports){
module.exports = isMobile; 

function isMobile() {
  return { 
    android: () => navigator.userAgent.match(/Android/i),
    blackberry: () => navigator.userAgent.match(/BlackBerry/i),
    ios: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
    opera: () => navigator.userAgent.match(/Opera Mini/i),
    windows: () => navigator.userAgent.match(/IEMobile/i),
    any: () => (
      isMobile().android() ||
      isMobile().blackberry() ||
      isMobile().ios() ||
      isMobile().opera() ||
      isMobile().windows()
    ),
  }
}
},{}]},{},[1]);
