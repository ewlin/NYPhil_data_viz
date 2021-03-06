function generateSeasons (start, end) {
	let seasons = []; 
	
	for (let i = start; i <= end; i++) {
		let nextSeas = String(i + 1).slice(2, 4);
		seasons.push(String(`${i}-${nextSeas}`)); 
	}
	
	return seasons; 
}

//Incomplete; need to finish and move to utilities folder
function formatComposerName (name) {
    let names = name.split(','); 
	let match; 
    let surname; 
    surname = (match = names[0].match(/\[.*\]/)) ? match[0].substr(1, match[0].length - 2) : names[0]; 
    console.log(surname); 
}

const ALL_SEASONS = generateSeasons(1842, 2016); 

//let composersByTotal = []; 

//let composerArray; 
//let composersByFirstSeason; 

//let transitionBar = function() {}; 
//let screen_height = window.outerHeight; 


let beethovenWorks = []; 

let svgDimensions; 

//Github pages bug
d3.json('/NYPhil_data_viz/data/new_top60.json', composers => {
//DEV
//d3.json('../../data/new_top60.json', composers => {
	
	const SVG_WIDTH = $('.main-container').innerWidth(); 
	const SVG_HEIGHT = $(window).innerHeight()*.75; 
	console.log(SVG_WIDTH);
	console.log(SVG_HEIGHT); 
	
	let seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([SVG_WIDTH*.05,SVG_WIDTH*.95]); 
	let yScale = d3.scaleLinear().domain([0,31]).range([SVG_HEIGHT*.92, 0]);
	let svg = d3.select('.main-container').append('svg').attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT); 
	/*
	svg.append('rect').attr('x', 0).attr('y', 0)
	.attr('width', 80).attr('height', SVG_HEIGHT*.92).attr('opacity', .3).attr('fill', 'grey'); 
	*/
	
	//Axes logic and display 
	svgDimensions = document.getElementsByTagName('svg')[0].getBoundingClientRect(); 
	let axisYears = d3.axisBottom(seasonsScale)
										.tickValues(seasonsScale.domain().filter((season, i) => {
											const S = ["1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01", "2016-17"];
											return S.includes(season); 
										})) 
										.tickSize(SVG_HEIGHT*.92);
	
	let axisFreq = d3.axisLeft(yScale)
										.ticks(5)
										.tickSize(SVG_WIDTH*.009); 
			
	let dotXAxis = svg.append('g')
									.attr('class', 'axis')
									.attr('transform',`translate(${-seasonsScale.bandwidth()/2.4},0)`)
									.call(axisYears); 
	
	dotXAxis.select('.domain').remove(); 
	dotXAxis.selectAll('.tick line')
					.style('stroke', 'White')
					.style('stroke-dasharray', '8,3'); 
	
	dotXAxis.selectAll('.tick text').attr('transform', `translate(0,${SVG_HEIGHT*.015})`); 
	dotXAxis.append('text').attr('class', 'axis-label x-axis-label')
					.text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS')
					.attr('transform', `translate(${SVG_WIDTH*.5},${SVG_HEIGHT*.995})`); 
	
	let dotFreqAxis = svg.append('g').attr('class', 'axis').attr('transform', `translate(${SVG_WIDTH*.05},0)`).call(axisFreq); 
	
	dotFreqAxis.select('.domain').remove(); 
	dotFreqAxis.append('text').attr('class', 'axis-label').text('NUMBER OF COMPOSITIONS PER SEASON')
														.attr("transform", "rotate(-90)")
														//.attr('dx', -SVG_HEIGHT/2.5)
														.attr('dy', -SVG_WIDTH*0.03); 
	
	
	//Event listeners
	$('.select-value').on('change', function(e) {
		$('.composer-face').remove(); 
		let index = this.value; 
		console.log(composers[index]); 
		let composer = composers[index].composer; 
		let composerImage = composer === 'Strauss,  Johann, II'
												? 'strauss_j.png' 
												: composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
		$('.composer-face-container').append(`<img class='composer-face' src='assets/images/composer_sqs/${composerImage}'/>`); 
		
		renderDots(index); 
	});
	
	//Reset dots 
	$('svg').on('click', function(e) {
		let index = $('.select-value').val() || 0; 
		//THIS APPROACH IS PROBABLY WASTEFUL PERFORMANCE-WISE; redo without calling so much extra code 
		if (e.target.tagName !== 'circle') renderDots(index); 
	}); 
	
	//Create Options for select elements populated with composer names
	composers.forEach( (composer, idx) => {
		let option = `<option value='${idx}'>${composer.composer}</option>`; 
		$('.select-value').append(option); 
	}); 
	
	function renderDots(number) {
		let composer = composers[number]; 
		let composerIndex = number; 
		//let birthSeason = composer.birth + "-" + (+composer.birth.substr(2) + 1); 
		let birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(composer.birth) )]; 
		console.log(birthSeason); 
		let deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex( season => season.match(composer.death) )]; 

		//let deathSeason = composer.death + "-" + (+composer.death.substr(2) + 1); 
		console.log(deathSeason); 

		let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 

		let rectWidth; 
		
		if (!seasonsScale(deathSeason)) {
			rectWidth = 0; 
		} else {
			rectWidth = seasonsScale(deathSeason) - rectX; 
		}
		
		//console.log(beethoven); 
		beethovenWorks = []; 
		ALL_SEASONS.forEach( (season, season_idx) => {
			let works = composer.works; 
			//let seasonWorks = []; 
			let seasonWorkCount = 1; 
			works.forEach( (work, work_idx) => {
				let workSeasons = work.seasons; 
				let numOfPerformances = workSeasons.length; 

				if (workSeasons.includes(season)) {
					let workMetaData = {id: `${composerIndex}:${work_idx}`, 
														title: work.title, 
														season: season,
														seasonWorkCount: seasonWorkCount, 
													  seasonCount: work.seasonCount, 
													 	numOfPerfs: numOfPerformances, 
													  composer: work.composer}; 
					if (workSeasons.length === 1) {
						workMetaData["orphanWork"] = true; 
					} else if (workSeasons.indexOf(season) === 0) {
						workMetaData["firstPerf"] = true; 
					} 
					beethovenWorks.push(workMetaData); 
					seasonWorkCount++; 
				}
				
			});
		//beethovenSeasons.push({season: season, works: seasonWorks}); 
		
		}); 
		
		
		// Composer birth-death box 
		svg.select('rect').transition().duration(1400).attr('x', rectX)
		//		let birthSeason = d.birth + "-" + (+d.birth.substr(2) + 1); 
		//		return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : -100; 
		//.attr('y', 0)
		.attr('width', rectWidth); 
    
    d3.select('.lifetime-box').select('line').transition().duration(1400).attr('x1', rectX)
    .attr('x2', rectX + rectWidth); 
		
		//		let birthSeason = d.birth + "-" + (+d.birth.substr(2) + 1); 
		//		let deathSeason = d.death + "-" + (+d.death.substr(2) + 1); 
		//		if (seasonsScale(birthSeason))
		//.attr('height', SVG_HEIGHT*.92)
		//.attr('opacity', .3).attr('fill', 'grey'); 
		
		
		let dots = svg.selectAll('circle')
			.data(beethovenWorks); 
		
		
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
				if (d.orphanWork) return 'gray'; 
			})
			.attr('opacity', 1)
			.attr('stroke-width', 1)
			.attr('r', seasonsScale.bandwidth()/2.4); 
		
		dots.enter().append('circle').attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', SVG_HEIGHT + 5)
			.attr('class', 'piece')
			.on('click', d => {
				let id = d.id; 
				console.log(d.id); 
				console.log(d.title); 
				d3.selectAll('.piece').attr('stroke', d => {
					if (d.id == id) return 'white'; 
				}).attr('opacity', d => {
					if (d.id != id) return 0.4; 
					else return 1; 
				})
				.attr('r', seasonsScale.bandwidth()/2.4)					
				.attr('stroke-width', 1); 
		
				d3.select(d3.event.target)
					.attr('stroke-width', 3)
					.attr('r', seasonsScale.bandwidth()/1.5); 
			}).on('mouseover', d => {
				console.log(composer.composer); 
				let dimensions = d3.event.target.getBoundingClientRect(); 
				let left = dimensions.right > svgDimensions.left + svgDimensions.width/2 
												? dimensions.right - 320
												: dimensions.right + 10; 
				let tooltip = d3.select('.tooltip').style('left', left + "px"); 
				let height; 
				//let html = `<span class='tooltip-title'>${d.title}</span><br><span class='tooltip-content'>${d.season} season</span><br><span class='tooltip-content'>Appeared in ${d.seasonCount} ${d.seasonCount == 1 ? 'season' : 'seasons'}</span>`;
				let html = `<span class='tooltip-title'>${d.title}</span><br><span class='tooltip-content'><em>${d.season} season</em></span><br><span class='tooltip-content'>Appeared in ${d.seasonCount} ${d.seasonCount == 1 ? 'season' : 'seasons'}</span><br><span class='tooltip-content'>${((d.numOfPerfs/beethovenWorks.length)*100).toFixed(2)}% of all performances of works by ${d.composer}</span>`; 
				tooltip.html(html); 
				height = document.querySelector('.tooltip').getBoundingClientRect().height; 
				tooltip.style('top', (dimensions.top - Math.floor(height/2)) + "px"); 
				tooltip.transition().duration(500).style('opacity', .9); 
				d3.select(d3.event.target)
					.attr('stroke-width', 3)
					.attr('r', seasonsScale.bandwidth()/1.5); 
			}).on('mouseout', d => {
				let tooltip = d3.select('.tooltip'); 
				tooltip.transition().duration(300).style('opacity', 0); 
				d3.select(d3.event.target)
					.attr('stroke-width', 1)
					.attr('r', seasonsScale.bandwidth()/2.4); 
			}).transition().duration(1400)	
			.attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', d => yScale(d.seasonWorkCount))
			.attr('fill', d => {
				if (d.orphanWork) return 'none'; 
				if (d.firstPerf) return 'Tomato'; 
				else return '#3f74a1'; 
			})
			.attr('stroke', d => {
				if (d.orphanWork) return 'gray'; 
			}); 
	
	}
	
	let beethoven = composers[0]; 
	let composerIndex = 0; 
	console.log(beethoven); 
	
	let composer = beethoven.composer; 
	let composerImage = composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
	$('.composer-face-container').append(`<img class='composer-face' src='assets/images/composer_sqs/${composerImage}'/>`); 
	
	let birthSeason = beethoven.birth + "-" + (+beethoven.birth.substr(2) + 1); 
	console.log(birthSeason); 
	let deathSeason = beethoven.death + "-" + (+beethoven.death.substr(2) + 1); 
	console.log(deathSeason); 
	let rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43"); 
	let rectWidth; 
	
	if (!seasonsScale(deathSeason)) {
		rectWidth = 0; 
	} else {
		rectWidth = seasonsScale(deathSeason) - rectX; 
	}
	
  let lifetime = svg.append('g').attr('class', 'lifetime-box'); 
  
  lifetime.append('rect').attr('x', rectX)
		//		let birthSeason = d.birth + "-" + (+d.birth.substr(2) + 1); 
		//		return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : -100; 
		.attr('y', 0)
		.attr('width', rectWidth)
		//		let birthSeason = d.birth + "-" + (+d.birth.substr(2) + 1); 
		//		let deathSeason = d.death + "-" + (+d.death.substr(2) + 1); 
		//		if (seasonsScale(birthSeason))
		.attr('height', SVG_HEIGHT*.92)
		.attr('opacity', .3).attr('fill', 'grey'); 
	
  //LINE ABOVE LIFETIME BOX
  lifetime.append('line')
    .attr('x1', rectX)
    .attr('x2', rectX + rectWidth)
    .attr('y1', 0)
    .attr('y2', 0)
    .attr('stroke', '#ff645f')
    .attr('stroke-width', '10');
  
	
	ALL_SEASONS.forEach( (season, season_idx) => {
		let works = beethoven.works; 
		//let seasonWorks = []; 
		let seasonWorkCount = 1; 
		works.forEach( (work, work_idx) => {
			let workSeasons = work.seasons; 
			let numOfPerformances = workSeasons.length; 
			
			if (workSeasons.includes(season)) {
				let workMetaData = {id: `${composerIndex}:${work_idx}`, 
														title: work.title, 
														season: season,
														seasonWorkCount: seasonWorkCount, 
													  seasonCount: work.seasonCount, 
													 	numOfPerfs: numOfPerformances, 
													  composer: work.composer}; 
				if (workSeasons.length === 1) {
					workMetaData["orphanWork"] = true; 
				} else if (workSeasons.indexOf(season) === 0) {
					workMetaData["firstPerf"] = true; 
				} 
				beethovenWorks.push(workMetaData); 
				seasonWorkCount++; 
			}
			
		});
		//beethovenSeasons.push({season: season, works: seasonWorks}); 
		
	}); 
	
	console.log(beethovenWorks); 
	
	//DOT Chart scales
	
	svg.selectAll('.piece')
			.data(beethovenWorks)
			.enter()	
			.append('circle')
			.attr('class', 'piece')
			.attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', d => yScale(d.seasonWorkCount))
			.attr('fill', d => {
				if (d.orphanWork) return '#343434'; 
				if (d.firstPerf) return 'Tomato'; 
				else return '#3f74a1'; 
			})
			.attr('stroke', d => {
				if (d.orphanWork) return 'gray'; 
			})
			.on('click', d => {
				let id = d.id; 
			
				d3.selectAll('.piece').attr('stroke', d => {
					if (d.id == id) return 'white'; 
				}).attr('opacity', d => {
					if (d.id != id) return 0.4; 
					else return 1; 
				}).attr('r', seasonsScale.bandwidth()/2.4).attr('stroke-width', 1); 

				d3.select(d3.event.target)
					.attr('stroke-width', 3)
					.attr('r', seasonsScale.bandwidth()/1.5); 
			}).on('mouseover', d => {
				//	console.log(document.getElementsByTagName('svg')[0].getBoundingClientRect()); 
				// determine if tooltip goes on right or left side of dot depending on which side of center it's on
				let dimensions = d3.event.target.getBoundingClientRect(); 
				let left = dimensions.right > svgDimensions.left + svgDimensions.width/2 
												? dimensions.right - 320
												: dimensions.right + 10; 
				let tooltip = d3.select('.tooltip').style('left', left + "px"); 
				let height; 
				//let tooltip = d3.select('.tooltip').style('left', left + "px")
				//								.style('top', dimensions.top + "px"); 
				let html = `<span class='tooltip-title'>${d.title}</span><br><span class='tooltip-content'><em>${d.season} season</em></span><br><span class='tooltip-content'>Appeared in ${d.seasonCount} ${d.seasonCount == 1 ? 'season' : 'seasons'}</span><br><span class='tooltip-content'>${((d.numOfPerfs/beethovenWorks.length)*100).toFixed(2)}% of all performances of works by ${d.composer}</span>`; 
				tooltip.html(html); 
				height = document.querySelector('.tooltip').getBoundingClientRect().height; 
				tooltip.style('top', (dimensions.top - Math.floor(height/2)) + "px"); 
				tooltip.transition().duration(500).style('opacity', .9); 
				d3.select(d3.event.target)
					.attr('stroke-width', 3)
					.attr('r', seasonsScale.bandwidth()/1.5); 
			}).on('mouseout', d => {
				let tooltip = d3.select('.tooltip'); 
				tooltip.transition().duration(300).style('opacity', 0); 
				d3.select(d3.event.target)
					.attr('stroke-width', 1)
					.attr('r', seasonsScale.bandwidth()/2.4); 
			}); 
	
	d3.select('body').append('div')
										.attr('class', 'tooltip')
										.style('opacity', 0); 

	//d3.select("body").selectAll(".tick").select("line")
	//						.attr("stroke", "White")
	//						.attr("stroke-dasharray", "2,2"); 

  
  dotFreqAxis.selectAll(".tick").select("line")
						.attr("stroke", "White")
						.attr("stroke-dasharray", "2,2"); 
	/**
	//TODO some redundant code here. Clean up 
	composers.forEach( composer => {
		let works = composer.works; 
		let worksByYears = {composer: composer.composer, seasons: {}, firstSeason: null}; 
		ALL_SEASONS.forEach( season => {
			let worksPerSeason = works.reduce( (total,work) => {
				 return work.seasons.includes(season) ? total + 1 : total; 
			}, 0); 
			worksByYears.seasons[season] = worksPerSeason; 
			if (!worksByYears.firstSeason) {
				if (worksPerSeason) worksByYears.firstSeason = season; 
			}
		}); 
		composersByTotal.push(worksByYears); 
	}); 
	
	//Reduce clutter
	composersArray = composersByTotal.map( composer => {
		let composerSeasonsArr = []; 
		let composerSeasons = composer.seasons; 
		
		for (let s in composerSeasons) {
			composerSeasonsArr.push({season: s, count: composerSeasons[s]}); 
		}
		
		return {composer: composer.composer, seasons: composerSeasonsArr, firstSeason: composer.firstSeason}; 
	}); 
	
	
	composersByFirstSeason = composersArray.slice()
																			.sort( (a,b) => parseInt(a.firstSeason) - parseInt(b.firstSeason) );

	console.log('Composers by total:')
	console.log(composersByTotal); 
	//scale to determine where bar goes for each season 
	let x = d3.scaleBand().domain(ALL_SEASONS)
										.range([0, 1050])
										.padding(.1); 
	
	let densityScale = d3.scalePow().exponent(.8).domain([0,30]).range([0,1]); 
	**/


}); 



