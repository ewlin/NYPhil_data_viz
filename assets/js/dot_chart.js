function generateSeasons (start, end) {
	let seasons = []; 
	
	for (let i=start; i<=end; i++) {
		let nextSeas = String(i+1).slice(2,4);
		seasons.push(String(`${i}-${nextSeas}`)); 
	}
	
	return seasons; 
}


const ALL_SEASONS = generateSeasons(1842, 2016); 

const BAR_HEIGHT = 45; 

let composersByTotal = []; 

let composerArray; 
let composersByFirstSeason; 

let transitionBar = function() {}; 
let screen_height = window.outerHeight; 


let beethovenWorks = []; 

let svgDimensions; 

//Github pages bug
//d3.json('/NYPhil_data_viz/top60_alt.json', composers => {
//DEV
d3.json('../../data/top60_alt.json', composers => {
	
	const SVG_WIDTH = $('.main-container').innerWidth(); 
	const SVG_HEIGHT = $(window).innerHeight()*.75; 
	console.log(SVG_WIDTH);
	console.log(SVG_HEIGHT); 
	
	let seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([SVG_WIDTH*.05,SVG_WIDTH*.95]); 
	let yScale = d3.scaleLinear().domain([0,31]).range([SVG_HEIGHT*.92, 0]);
	let svg = d3.select('.main-container').append('svg').attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT); 
	
	svgDimensions = document.getElementsByTagName('svg')[0].getBoundingClientRect(); 
	let axisYears = d3.axisBottom(seasonsScale)
										.tickValues(seasonsScale.domain().filter((season, i) => {
											const S = ["1842-43", "1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01", "2016-17"];
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
					.text('SEASONS')
					.attr('transform', `translate(${SVG_WIDTH/2+10},${SVG_HEIGHT*.99})`); 
	
	let dotFreqAxis = svg.append('g').attr('class', 'axis').attr('transform', `translate(${SVG_WIDTH*.05},0)`).call(axisFreq); 
	
	dotFreqAxis.select('.domain').remove(); 
	dotFreqAxis.append('text').attr('class', 'axis-label').text('Number of Compositions per Season')
														.attr("transform", "rotate(-90)")
														//.attr('dx', -SVG_HEIGHT/2.5)
														.attr('dy', -SVG_WIDTH*0.03); 
	
	$('.select-value').on('change', function(e) {
		$('.composer-face').remove(); 
		let index = this.value; 
		console.log(composers[index]); 
		let composer = composers[index].composer; 
		let composerImage = composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
		$('.composer-face-container').append(`<img class='composer-face' src='assets/images/composer_sqs/${composerImage}'/>`); 
		renderDots(index); 
	});
	
	//Reset dots 
	$('svg').on('click', function(e) {
		let index = $('.select-value').val() || 0; 
		//THIS APPROACH IS PROBABLY WASTEFUL PERFORMANCE-WISE; redo without calling so much extra code 
		if (e.target.tagName !== 'circle') renderDots(index); 
	}); 
	
	composers.forEach( (composer, idx) => {
		let option = `<option value='${idx}'>${composer.composer}</option>`; 
		$('.select-value').append(option); 
	}); 
	
	function renderDots(number) {
		let composer = composers[number]; 
		let composerIndex = number; 
		//console.log(beethoven); 
		beethovenWorks = []; 
		ALL_SEASONS.forEach( (season, season_idx) => {
			let works = composer.works; 
			//let seasonWorks = []; 
			let seasonWorkCount = 1; 
			works.forEach( (work, work_idx) => {
				let workSeasons = work.seasons; 
				if (workSeasons.includes(season)) {
					let workMetaData = {id: `${composerIndex}:${work_idx}`, 
															title: work.title, 
															season: season,
															seasonWorkCount: seasonWorkCount}; 
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
		//DOT Chart scales
		//let seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([0,SVG_WIDTH]); 
		//let yScale = d3.scaleLinear().domain([0,30]).range([SVG_HEIGHT, 0]);
		//let svg = d3.select('.main-container').append('svg').attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT); 
		
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
				else return 'Steelblue'; 
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
				//console.log('in'); 
				let dimensions = d3.event.target.getBoundingClientRect(); 
				let left = dimensions.right > svgDimensions.left + svgDimensions.width/2 
												? dimensions.right - 320
												: dimensions.right + 10; 
				let tooltip = d3.select('.tooltip').style('left', left + "px")
												.style('top', dimensions.top + "px"); 
				let html = `<span class='tooltip-title'>${d.title}</span><br><span class='tooltip-content'>${d.season} season</span>`; 
				tooltip.html(html); 
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
				else return 'Steelblue'; 
			})
			.attr('stroke', d => {
				if (d.orphanWork) return 'gray'; 
			}); 
			
		
					//.attr('cy', d => -5).attr('cx', d => -5) 
		/*
		dots.transition().duration(1400)	
			.attr('r', seasonsScale.bandwidth()/2.4)
			.attr('cx', d => seasonsScale(d.season))
			.attr('cy', d => yScale(d.seasonWorkCount))
			.attr('fill', d => {
				if (d.orphanWork) return 'none'; 
				if (d.firstPerf) return 'Tomato'; 
				else return 'Steelblue'; 
			})
			.attr('stroke', d => {
				if (d.orphanWork) return 'gray'; 
			})
			.on('click', d => {
				let id = d.id; 
				console.log(d.title); 
				console.log(d3.select(d3.event.target)); 
				d3.selectAll('.piece').attr('stroke', d => {
					if (d.id == id) return 'white'; 
				}).attr('opacity', d => {
					if (d.id != id) return 0.4; 
					else return 1; 
				}).attr('r', seasonsScale.bandwidth()/2.4); 
		
				d3.select(d3.event.target)
					.attr('stroke-width', 3)
					.attr('r', seasonsScale.bandwidth()/1.5); 
			}); 
		*/
			
		
	}
	
	//renderDots(1);
	
	//$('button').on('click', function(e) { 
	//	$('.composer-face').remove(); 
	//	let index = $('.nums').val(); 
	//	console.log(composers[index]); 
	//	let composer = composers[index].composer; 
	//	let composerImage = composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
	//	$('.composer-face-container').append(`<img class='composer-face' src='assets/images/composer_sqs/${composerImage}'/>`); 
	//	renderDots(index); 
	//})
	
	
	
	let beethoven = composers[0]; 
	let composerIndex = 0; 
	console.log(beethoven); 
	
	let composer = beethoven.composer; 
	let composerImage = composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
	$('.composer-face-container').append(`<img class='composer-face' src='assets/images/composer_sqs/${composerImage}'/>`); 
	
	ALL_SEASONS.forEach( (season, season_idx) => {
		let works = beethoven.works; 
		//let seasonWorks = []; 
		let seasonWorkCount = 1; 
		works.forEach( (work, work_idx) => {
			let workSeasons = work.seasons; 
			if (workSeasons.includes(season)) {
				let workMetaData = {id: `${composerIndex}:${work_idx}`, 
														title: work.title, 
														season: season,
														seasonWorkCount: seasonWorkCount}; 
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
				else return 'Steelblue'; 
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
				let tooltip = d3.select('.tooltip').style('left', left + "px")
												.style('top', dimensions.top + "px"); 
				let html = `<span class='tooltip-title'>${d.title}</span><br><span class='tooltip-content'>${d.season} season</span>`; 
				tooltip.html(html); 
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
	
	d3.select('body').append('div').attr('class', 'tooltip').style('opcaity', 0); 

	
	
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
	
	
	
  //let axisYears = d3.axisTop(x)
	//									.tickValues(x.domain().filter((season, i) => {
	//										const S = ["1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01"];
	//										return S.includes(season); 
	//									}))
	//									.tickSize(screen_height)
									
	
	
	let axis = d3.select("body").select(".heat-container")
			.append("svg")
			.attr("class", "axis")
			.attr("width", SVG_WIDTH)
			.attr("height", screen_height)
			.attr("x", 0)
			.attr("y", 0)
			.append("g")
	    .attr("transform", `translate(-${x.bandwidth()/2},${screen_height+20})`)
			.call(axisYears)
			
	axis.selectAll("text").attr("fill", "white").attr("font-size", "15px");
	axis.select(".domain").remove(); 
	
	d3.select("body").selectAll(".tick").select("line")
							.attr("stroke", "White")
							.attr("stroke-dasharray", "2,2")
												
	const SVG = d3.select(".heat-container").append("svg")
								.attr("class", "main-svg")
								.attr("x", 0)
								.attr("y", 0)
								.attr("width", SVG_WIDTH)
								.attr("height", composers.length * BAR_HEIGHT + 50); 
		
	
	
	let bars = SVG.selectAll(".composer")
			.data(composersArray)
			.enter()
			.append("g")
			.attr("class", "composer-bar")
			.attr("transform", (d, i) => "translate(0," + i*BAR_HEIGHT + ")"); 
	
	bars.selectAll(".season")
			.data( d => d.seasons)
			.enter()
			.append("rect")
			.attr("y", 0)
			.attr("x", d => x(d.season))
			.attr("height", BAR_HEIGHT)
			.attr("width", x.bandwidth)
			.attr("fill", "Tomato")
			.attr("fill-opacity", d => densityScale(d.count))


			////Borders around works that have 5+ performances
			//.attr("stroke", "#369c9c")
			////.attr("stroke-width", d => d.count >= 10 ? 2 : 0)
			//.attr("stroke-width", d => d.season >= "2007-08" && d.count > 0 ? 2 : 0)
			//.attr("stroke-opacity", 0.7)
	
	bars.append("text")
			.attr("class", "composer-name")
			.text( (d) => { 
				let c = d.composer.split("  "); 
				let first = c[0].match(/\[.*\]/) ? c[0].match(/\[.*\]/)[0].slice(1,c[0].match(/\[.*\]/)[0].length-1) : c[0]; 
				return `${first} ${c[1].trim().slice(0,1)}.`; 
			}).attr("transform", `translate(1060, 27)`)
			.attr("fill", "White")
			.attr("font-family", "Arial")
			.attr("font-size", "14px"); 

	
	//console.log(SVG.selectAll(".composer-bar").sort(function(a, b) { return x0(a.letter) - x0(b.letter) })); 

	
	transitionBar = function (newData, color) {
		
		bars.data(newData)
			.transition()
			.duration(0);
		
		bars.selectAll("rect").data(d => d.seasons)
								.transition()
								.duration(1200)
								.attr("fill", color)
								.attr("fill-opacity", d => densityScale(d.count))
						//.attr("stroke", "#369c9c")
						////.attr("stroke-width", d => d.count >= 10 ? 2 : 0)
						//.attr("stroke-width", d => d.season >= "2007-08" && d.count > 0 ? 2 : 0)
						//.attr("stroke-opacity", 0.7);
		
		bars.select(".composer-name")
			.transition()
			.duration(1200)
			.text( (d) => { 
				let c = d.composer.split(","); 
				let first = c[0].match(/\[.*\]/) ? c[0].match(/\[.*\]/)[0].slice(1,c[0].match(/\[.*\]/)[0].length-1) : c[0]; 
				return `${first}, ${c[1].trim().slice(0,1)}.`; 
			});
				
	}
	
	//Sorting
	//document.getElementById("buttons").addEventListener("click", (e) => {
	//	document.getElementsByClassName("active")[0].classList.remove("active");
	//	let target = e.target; 
	//	target.classList.add("active");
	//	
	//	if (target.id == "by-first-season") {
	//		transition(composersByFirstSeason, "Steelblue"); 
	//	} else if (target.id == "by-most-performances") {
	//		transition(composersArray, "Tomato"); 
	//	}
	//}); 
	

}); 

function findMax(composersArr) {
	return composersArr.reduce( (max, composer) => {
		let seasons = composer.seasons; 
		let highest = 0; 
		for (let season in seasons) {
			highest = seasons[season] > highest ? seasons[season] : highest; 
		}
		return max > highest ? max : highest; 
	}, 0); 
}

