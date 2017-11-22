"use strict";

(function e(t, n, r) {
  function s(o, u) {
    if (!n[o]) {
      if (!t[o]) {
        var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);var f = new Error("Cannot find module '" + o + "'");throw f.code = "MODULE_NOT_FOUND", f;
      }var l = n[o] = { exports: {} };t[o][0].call(l.exports, function (e) {
        var n = t[o][1][e];return s(n ? n : e);
      }, l, l.exports, e, t, n, r);
    }return n[o].exports;
  }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
    s(r[o]);
  }return s;
})({ 1: [function (require, module, exports) {
    var generateSeasons = require('../../temp_utils/generate_seasons.js');
    var isMobile = require('../../temp_utils/is-mobile.js');
    var debounce = require('just-debounce-it');

    var ALL_SEASONS = generateSeasons(1842, 2016);

    function any(array, func) {
      var bool = false;
      for (var i = 0; i < array.length; i++) {
        if (func(array[i])) bool = true;
      }
      return bool;
    }

    //Incomplete; need to finish and move to utilities folder
    function formatComposerName(name) {
      var names = name.split(',');
      var match = void 0;

      // hackish way to remove spaces
      var firstname = names[1].trim().split(' ').filter(function (el) {
        return !!el;
      }).join(' ');
      var surname = (match = names[0].match(/\[.*\]/)) ? match[0].substr(1, match[0].length - 2) : names[0];
      return names.length === 3 ? (firstname + " " + surname + " II").trim() : (firstname + " " + surname).trim();
    }

    //Random composer generator for mobile charts
    function generateRandomComposer() {
      var birth = Math.floor(Math.random() * 78) + 1842;
      var death = birth + 62;
      var works = [];
      ALL_SEASONS.forEach(function (season, idx) {
        var randomNum = parseInt(season) > birth + 20 ? Math.floor(Math.random() * 7) : 0;
        var parseSeason = parseInt(season);
        var seasonObj = { season: season, count: parseSeason - birth === 100 ? 14 : randomNum };
        works.push(seasonObj);
      });
      return { composer: 'Composer X', birth: birth, death: death, seasons: works };
    }

    var svgDimensions = void 0;

    var composerWorks = [];
    var currentType = void 0;

    //Github pages bug
    d3.json('/NYPhil_data_viz/data/new_top60.json', function (composers) {
      //DEV
      //d3.json('../../data/new_top60.json', composers => {
      //experiment with all composers
      //d3.json('../../data/composers.json', composers => {

      /*DOT CHART VARIABLES*/
      //SVG dimensions for DOT CHART
      var SVG_WIDTH = $('.main-container').innerWidth();
      var SVG_HEIGHT = $(window).innerHeight() * .75; //REDO and calculate as innerHeight - (title + dropdown)

      //Heatmap color values (use samples[3])
      //let samples = [[27, 243, 6, 128, 94, 52], [89, 248, 15, 182, 15, 7], [94, 207, 34, 195, 175, 46], [89, 207, 15, 195, 15, 46]]; 

      //scales for DOT CHART
      var seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([SVG_WIDTH * .05, SVG_WIDTH * .95]);
      var yScale = d3.scaleLinear().domain([0, 31]).range([SVG_HEIGHT * .92, 0]);

      //Begin Voronoi tests; voronoi generator/accessors
      var voronoiGen = d3.voronoi().x(function (d) {
        return seasonsScale(d.season);
      }).y(function (d) {
        return yScale(d.seasonWorkCount);
      });

      //SVG container
      var svg = void 0;

      //Axes logic and display 
      var axisYears = d3.axisBottom(seasonsScale).tickValues(seasonsScale.domain().filter(function (season, i) {
        var windowWidth = window.innerWidth;
        var S = ["1842-43", "1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01", "2016-17"];
        var S_MOBILE = ["1850-51", "1900-01", "1950-51", "2000-01"];
        return windowWidth >= 1100 ? S.includes(season) : S_MOBILE.includes(season);
      })).tickSize(SVG_HEIGHT * .92);

      var axisFreq = d3.axisLeft(yScale).ticks(5).tickSize(SVG_WIDTH * .009);

      //Global SVG DOM elements
      var dotXAxis = void 0;
      var dotFreqAxis = void 0;

      //Dot chart contents
      //Lifetime box
      var lifetime = void 0;
      //Dots grouping
      var dots = void 0;
      //Voronoi grouping
      var voronoiOverlay = void 0;

      /*MOBILE CHARTS VARIABLES*/

      var chartsContainer = void 0;
      var margins = { top: 7, left: 20, bottom: 20, right: 8 }; //could be const
      var height = 95 - margins.bottom - margins.top; //could be const
      var mobileWidth = void 0; // = $('.composer-charts').innerWidth() - margins.left - margins.right; 

      var seasonXScale = void 0;
      var freqYScale = d3.scaleLinear().domain([0, 31]).range([height, 0]);
      var xAxis = void 0;
      var yAxis = d3.axisLeft(freqYScale).tickValues([0, 30]).tickSize(0);
      var chartArea = void 0;

      //Heatmap container 
      var heatmapContainer = void 0; // = svg.append('g').attr('class', 'heatmapPow'); 
      var grid = void 0; // = heatmapContainer.append('g').attr('class', 'grid'); 
      var texts = void 0; //= svg.append('g').attr('class', 'grid-labels'); 

      //let seasonsLabels = [{row: 0, season: "1842-59"}, {row: 2, season: "1880-99"}, {row: 4, season: "1920-39"}, {row: 6, season: "1960-79"}, {row: 8, season: "2000-17"}]
      //  
      //let gridLabels = texts.selectAll('texts').data(seasonsLabels).enter().append('text'); 

      //Heatmap Scales
      var scaleCol = d3.scaleLinear().domain([0, 20]).range([0, SVG_WIDTH * .8]),
          gridCellWidth = scaleCol(1);

      //Event listeners when option is selected from dropdown
      $('.select-value').on('change', function (e) {
        var index = this.value;
        renderComposer(index);
      });

      function setupDotChart() {
        //grab SVG dimensions: 
        SVG_WIDTH = $('.main-container').innerWidth();
        SVG_HEIGHT = $(window).innerHeight() * .75; //REDO and calculate as innerHeight - (title + dropdown)
        //add SVG container 
        svg = d3.select('.main-container').append('svg').attr('class', 'composers-chart-container').attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT);

        //Add X axis
        dotXAxis = svg.append('g').attr('class', 'axis axis-years').attr('transform', "translate(" + -seasonsScale.bandwidth() / 2.4 + ",0)").call(axisYears);

        dotXAxis.select('.domain').remove();
        dotXAxis.selectAll('.tick line').style('stroke', 'White').style('stroke-dasharray', '8,3');
        dotXAxis.selectAll('text').style("text-anchor", function (d) {
          return d === '1842-43' || d === '2016-17' ? "middle" : "start";
        });

        dotXAxis.selectAll('.tick text').attr('transform', "translate(0," + SVG_HEIGHT * .015 + ")");
        dotXAxis.append('text').attr('class', 'axis-label x-axis-label').text('NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS').attr('text-anchor', 'middle').attr('x', SVG_WIDTH * .5).attr('transform', "translate(0," + SVG_HEIGHT * .995 + ")");

        //Add Y Axis
        dotFreqAxis = svg.append('g').attr('class', 'axis axis-freq').attr('transform', "translate(" + SVG_WIDTH * .05 + ",0)").call(axisFreq);

        dotFreqAxis.select('.domain').remove();
        dotFreqAxis.append('text').attr('class', 'axis-label').text('NUMBER OF COMPOSITIONS PER SEASON').attr("transform", "rotate(-90)")
        //.attr('dx', -SVG_HEIGHT/2.5)
        .attr('dy', -SVG_WIDTH * 0.03);

        dotFreqAxis.selectAll(".tick").select("line").attr("stroke", "White").attr("stroke-dasharray", "2,2");

        //Lifetime box setup
        var rectX = seasonsScale("1842-43");
        var rectWidth = 0;

        lifetime = svg.append('g').attr('class', 'lifetime-box');

        lifetime.append('rect').attr('x', rectX).attr('y', 0).attr('width', rectWidth).attr('height', SVG_HEIGHT * .92).attr('opacity', .2).attr('fill', 'grey');

        ////LINE ABOVE LIFETIME BOX
        lifetime.append('line').attr('x1', rectX).attr('x2', rectX + rectWidth).attr('y1', 0).attr('y2', 0).attr('stroke', '#ff645f').attr('stroke-width', '10');

        ////Dots grouping
        dots = svg.append('g').attr('class', 'dots-grouping');

        ////Voronoi grouping
        voronoiOverlay = svg.append('g').attr('class', 'voronoi-overlay');

        //Tooltip setup
        svgDimensions = document.getElementsByClassName('composers-chart-container')[0].getBoundingClientRect();

        d3.select('body').append('div').attr('class', 'tooltip').style('opacity', 0);
      }

      /* Temp variables for mobile 
        //Items needed by more than one function 
        let chartsContainer; 
        let margins = {top: 7, left: 20, bottom: 20, right: 8}; 
        let mobileWidth = $('.composer-charts').innerWidth() - margins.left - margins.right; 
       */
      function setupMobileCharts() {
        var topComposers = compileComposerSeasonData();

        //set up legend 
        //let chartsLegend = d3.select('.main-container').append('section').attr('class', 'composer-charts-legend'); 

        chartsContainer = d3.select('.main-container').append('section').attr('class', 'composer-charts');

        mobileWidth = $('.composer-charts').innerWidth() - margins.left - margins.right;
        seasonXScale = d3.scaleBand().domain(ALL_SEASONS).range([0, mobileWidth]);

        xAxis = d3.axisBottom(seasonXScale).tickValues(seasonsScale.domain().filter(function (season, i) {
          var S = ["1842-43", "2016-17"];
          return S.includes(season);
        })).tickSize(0);

        chartArea = d3.area().curve(d3.curveCardinal.tension(.1)).x(function (d) {
          return seasonXScale(d.season);
        }).y0(function (d) {
          return 0;
        }).y1(function (d) {
          return freqYScale(d.count);
        });

        topComposers.forEach(function (composer, idx) {
          var composerBar = chartsContainer.append('div').attr('class', 'composer-bar');
          var composerBarSVG = composerBar.append('svg').attr('class', 'composer-bar-svg').attr('id', "composer" + idx).attr('width', mobileWidth + margins.left + margins.right).attr('height', height + margins.top + margins.bottom);

          composerBar.append('p').html(formatComposerName(composer.composer) + " (" + composer.birth + "-" + composer.death + ")");

          var lifespan = { birth: composer.birth, death: composer.death };
          //lifetime box
          d3.select("#composer" + idx).append('rect').datum(lifespan).attr('height', height).attr('opacity', .2).attr('y', 0).attr('fill', 'grey').attr('transform', "translate(" + margins.left + ", " + margins.top + ")").attr('x', function (d) {
            var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
              return season.match(d.birth);
            })];
            return seasonXScale(birthSeason) ? seasonXScale(birthSeason) : seasonXScale("1842-43");
          }).attr('width', function (d) {
            var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
              return season.match(d.birth);
            })];
            var rectX = seasonXScale(birthSeason) ? seasonXScale(birthSeason) : seasonXScale("1842-43");
            var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
              return season.match(d.death);
            })];
            var rectWidth = void 0;

            if (!seasonXScale(deathSeason)) {
              rectWidth = 0;
            } else {
              rectWidth = seasonXScale(deathSeason) - rectX;
            }
            return rectWidth;
          });

          //line above lifetime box 
          d3.select("#composer" + idx).append('line').datum(lifespan).attr('x1', function (d) {
            var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
              return season.match(d.birth);
            })];
            return seasonXScale(birthSeason) ? seasonXScale(birthSeason) : seasonXScale("1842-43");
          }).attr('x2', function (d) {
            var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
              return season.match(d.death);
            })];
            return !seasonXScale(deathSeason) ? 0 : seasonXScale(deathSeason);
          }).attr('y1', 0).attr('y2', 0).attr('stroke', '#ff645f').attr('stroke-width', '6').attr('transform', "translate(" + margins.left + ", " + (margins.top + 3) + ")");

          //path for freq of pieces per season
          d3.select("#composer" + idx).append('path').datum(composer.seasons).attr('d', chartArea).attr('fill', 'none').attr('stroke', 'steelblue').attr('transform', "translate(" + margins.left + ", " + margins.top + ")");

          var y = d3.select("#composer" + idx).append('g').attr('class', 'composer-bar-axis').attr('transform', "translate(" + margins.left + ", " + margins.top + ")").call(yAxis);

          y.select('.domain').remove();

          var x = d3.select("#composer" + idx).append('g').attr('class', 'composer-bar-axis composer-bar-axis-x').attr('transform', "translate(" + margins.left + ", " + (margins.top + height) + ")").call(xAxis);

          x.select('.domain').remove();

          x.selectAll('.tick text').attr('transform', "translate(0, " + margins.bottom / 3 + ")").style("text-anchor", function (d) {
            if (d === '1842-43') return 'start';
            if (d === '2016-17') return 'end';
          });
        });

        //chartContainer.append('p').html('TESTEST');
        function compileComposerSeasonData() {
          var composersSeasonCounts = [];
          composers.forEach(function (composer, idx) {
            composersSeasonCounts.push(calculateComposerSeasonCount(composer, idx));
          });

          return composersSeasonCounts;
        }

        function calculateComposerSeasonCount(composer, composerIndex) {
          var seasonsCount = [];

          //composerWorks = []; 
          ALL_SEASONS.forEach(function (season, season_idx) {
            var works = composer.works;
            //accumulates the # of pieces per season by one composer
            var seasonWorkCount = 0;
            works.forEach(function (work, work_idx) {
              var workSeasons = work.seasons;
              var numOfPerformances = workSeasons.length;

              if (workSeasons.includes(season)) {
                ++seasonWorkCount;
              }
            });
            seasonsCount.push({ count: seasonWorkCount, season: season });
          });
          //object with composer name and array of seasons and a count for each season
          return {
            composer: composer.composer,
            birth: composer.birth,
            death: composer.death,
            seasons: seasonsCount
          };
        }
      }

      //Create Options for select elements populated with composer names
      composers.forEach(function (composer, idx) {
        var option = "<option value='" + idx + "'>" + formatComposerName(composer.composer) + "</option>";
        $('.select-value').append(option);
      });

      function desktopScrollToComposer(e) {
        var index = e.target.dataset.index;
        var dotChart = document.querySelector('.dot-chart .graphic-title');
        //Feature detection here for Element.scrollIntoView(). Options object arg only supported on newer versions of Firefox and Chrome 
        var chromeOrFirefox = navigator.userAgent.match(/Chrome\/\d*|Firefox\/\d*/);
        var browserType = chromeOrFirefox[0].match(/Chrome|Firefox/)[0];
        var browserVersion = chromeOrFirefox[0].match(/\d+/)[0];
        var options = browserType == 'Firefox' && browserVersion >= 36 || browserType == 'Chrome' && browserVersion >= 61 ? { block: 'start', behavior: 'smooth' } : null;

        if (e.target.dataset.index) {
          if (options) {
            dotChart.scrollIntoView(options);
          } else {
            dotChart.scrollIntoView();
          }
          selectComposer(index);
        }
      }

      function mobileScrollToComposer(e) {
        var index = e.target.dataset.index;
        var composerChart = document.querySelector("#composer" + index);
        composerChart.scrollIntoView();
      }

      $('.dot-chart-prelude').on('click', function (e) {
        if (currentType === 'dots') {
          desktopScrollToComposer(e);
        } else {
          mobileScrollToComposer(e);
        }
      });

      //Reset dots 
      $('#dot-chart').on('click', function (e) {
        var index = $('.select-value').val() || 0;
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
        SVG_HEIGHT = $(window).innerHeight() * .75; //REDO and calculate as innerHeight - (title + dropdown)

        //reset svg
        svg.attr('width', SVG_WIDTH).attr('height', SVG_HEIGHT);

        //TODO reset tooltip box
        svgDimensions = document.getElementsByClassName('composers-chart-container')[0].getBoundingClientRect();
        //Scales
        //let seasonsScale = d3.scaleBand().domain(ALL_SEASONS).range([SVG_WIDTH*.05, SVG_WIDTH*.95]); 
        //let yScale = d3.scaleLinear().domain([0,31]).range([SVG_HEIGHT*.92, 0]);
        seasonsScale.range([SVG_WIDTH * .05, SVG_WIDTH * .95]);
        yScale.range([SVG_HEIGHT * .92, 0]);
        voronoiGen.x(function (d) {
          return seasonsScale(d.season);
        }).y(function (d) {
          return yScale(d.seasonWorkCount);
        }).extent([[seasonsScale(composerWorks[0].season) - 7, yScale(d3.max(composerWorks, function (work) {
          return work.seasonWorkCount;
        })) - 7], [seasonsScale(composerWorks[composerWorks.length - 1].season) + 7, SVG_HEIGHT * .92]]);

        axisYears = d3.axisBottom(seasonsScale).tickSize(SVG_HEIGHT * .92)
        //Example for determining based on window size:  .tickValues(windowWidth <= 1024 ? [8, 58, 108, 158] : [8, 33, 58, 83, 108, 133, 158, 174])
        .tickValues(seasonsScale.domain().filter(function (season, i) {
          var windowWidth = window.innerWidth;
          var S = ["1842-43", "1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01", "2016-17"];
          var S_MOBILE = ["1850-51", "1900-01", "1950-51", "2000-01"];
          return windowWidth >= 1100 ? S.includes(season) : S_MOBILE.includes(season);
        }));

        axisFreq = d3.axisLeft(yScale).ticks(5).tickSize(SVG_WIDTH * .009);

        //redraw axes
        var dotXAxis = svg.select('.axis-years').attr('transform', "translate(" + -seasonsScale.bandwidth() / 2.4 + ",0)").call(axisYears);

        dotXAxis.select('.domain').remove();
        dotXAxis.selectAll('.tick line').style('stroke', 'White').style('stroke-dasharray', '8,3');
        dotXAxis.selectAll('text').style("text-anchor", function (d) {
          return d === '1842-43' || d === '2016-17' ? "middle" : "start";
        });
        dotXAxis.selectAll('.tick text').attr('transform', "translate(0," + SVG_HEIGHT * .015 + ")");

        dotXAxis.select('.x-axis-label').style('text-anchor', 'middle').attr('x', SVG_WIDTH * .5).attr('transform', "translate(0," + SVG_HEIGHT * .995 + ")");

        var dotFreqAxis = svg.select('.axis-freq').attr('transform', "translate(" + SVG_WIDTH * .05 + ",0)").call(axisFreq);

        dotFreqAxis.select('.domain').remove();

        dotFreqAxis.selectAll(".tick").select("line").attr("stroke", "White").attr("stroke-dasharray", "2,2");

        //redraw dots
        var dots = svg.select('.dots-grouping').selectAll('circle');
        dots.transition().duration(500).attr('r', seasonsScale.bandwidth() / 2.4).attr('cx', function (d) {
          return seasonsScale(d.season);
        }).attr('cy', function (d) {
          return yScale(d.seasonWorkCount);
        });

        //redraw voronoi overlay
        voronoiOverlay.selectAll('path').data(voronoiGen.polygons(composerWorks)).transition().duration(500).attr('d', function (d) {
          return "M" + d.join("L") + "Z";
        });

        //redraw lifetime box
        lifetime.select('rect').transition().duration(500).attr('x', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
        }).attr('width', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          var rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
          var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.death);
          })];
          var rectWidth = void 0;

          if (!seasonsScale(deathSeason)) {
            rectWidth = 0;
          } else {
            rectWidth = seasonsScale(deathSeason) - rectX;
          }
          return rectWidth;
        }).attr('height', SVG_HEIGHT * .92);

        lifetime.select('line').transition().duration(500).attr('x1', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
        }).attr('x2', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.death);
          })];
          var rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
          var rectWidth = void 0;

          if (!seasonsScale(deathSeason)) {
            rectWidth = 0;
          } else {
            rectWidth = seasonsScale(deathSeason) - rectX;
          }

          return (seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43")) + rectWidth;
        });
      }

      function mobileResize() {
        mobileWidth = $('.composer-charts').innerWidth() - margins.left - margins.right;
        seasonXScale = d3.scaleBand().domain(ALL_SEASONS).range([0, mobileWidth]);

        xAxis = d3.axisBottom(seasonXScale).tickValues(seasonsScale.domain().filter(function (season, i) {
          var S = ["1842-43", "2016-17"];
          return S.includes(season);
        })).tickSize(0);

        chartArea.x(function (d) {
          return seasonXScale(d.season);
        });
        //= d3.area()
        //.curve(d3.curveCardinal.tension(.1))

        //.y0(d => 0)
        //.y1(d => freqYScale(d.count));

        var bars = d3.selectAll('.composer-bar-svg');

        bars.transition().duration(500).attr('width', mobileWidth + margins.left + margins.right);

        bars.select('path').transition().duration(500).attr('d', chartArea);

        var x = bars.select('.composer-bar-axis-x').transition().duration(500).attr('transform', "translate(" + margins.left + ", " + (margins.top + height) + ")").call(xAxis);

        x.select('.domain').remove();

        //resize composer lifetime box in mobile charts
        bars.select('rect').transition().duration(500).attr('x', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          return seasonXScale(birthSeason) ? seasonXScale(birthSeason) : seasonXScale("1842-43");
        }).attr('width', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          var rectX = seasonXScale(birthSeason) ? seasonXScale(birthSeason) : seasonXScale("1842-43");
          var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.death);
          })];
          var rectWidth = void 0;
          if (!seasonXScale(deathSeason)) {
            rectWidth = 0;
          } else {
            rectWidth = seasonXScale(deathSeason) - rectX;
          }
          return rectWidth;
        });

        //resize line above lifetime box 
        bars.select('line').attr('x1', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          return seasonXScale(birthSeason) ? seasonXScale(birthSeason) : seasonXScale("1842-43");
        }).attr('x2', function (d) {
          var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.death);
          })];
          return !seasonXScale(deathSeason) ? 0 : seasonXScale(deathSeason);
        });
      }

      window.addEventListener('resize', debounce(resizeDelegation, 200));

      function resizeDelegation() {
        var type = void 0;
        if (!isMobile().any() && window.matchMedia("(min-width: 900px)").matches) {
          type = 'dots';
        } else {
          type = 'mobile';
        }

        console.log(currentType, type);
        if (currentType === type) {
          currentType === 'dots' ? resize() : mobileResize();
        } else {
          if (currentType === 'dots') {
            currentType = type;
            //check if mobile charts has been initialized, if not, do so. 
            if (!document.querySelector('.composer-charts')) {
              currentType = type;
              setupMobileCharts();
            }
            //Hide Dots
            d3.select('.dot-chart-heading-middle').classed('hidden', true);

            d3.select('.composers-chart-container').classed('hidden', true);
            //(svg.select('.lifetime-box').classed('hidden', true), svg.select('.dots-grouping').classed('hidden', true),
            //svg.select('.voronoi-overlay').classed('hidden', true), svg.selectAll('.axis').classed('hidden', true)); 
            //Show Mobile charts
            d3.select('.composer-charts').classed('hidden', false);

            //Resize mobile charts
            mobileResize();
          } else {
            //check if dot chart has been initialized, if not, do so. 
            if (!document.querySelector('.composers-chart-container')) {
              currentType = type;
              setupDotChart();
              //default initial composer for dot chart is beethoven
              selectComposer(0);
            }

            //Show Dots
            //(svg.select('.lifetime-box').classed('hidden', false), svg.select('.dots-grouping').classed('hidden', false),
            //svg.select('.voronoi-overlay').classed('hidden', false), svg.selectAll('.axis').classed('hidden', false)); 
            d3.select('.composers-chart-container').classed('hidden', false);

            d3.select('.dot-chart-heading-middle').classed('hidden', false);

            //Hide Mobile charts

            d3.select('.composer-charts').classed('hidden', true);
            //Resize chart
            resize();
          }
          //update current chart type
          currentType = type;
        }
      }

      function matchComposers(params, data) {
        // If there are no search terms, return all of the data
        var altNames = [{ name: 'antonin dvorak', id: 14 }, { name: 'camille saint-saens', id: 22 }, { name: 'bela bartok', id: 23 }, { name: 'cesar franck', id: 33 }, { name: 'frederic chopin', id: 34 }, { name: 'peter ilich tchaikovsky', id: 3 }, { name: 'sergey rachmaninov', id: 21 }, { name: 'modest mussorgsky', id: 35 }, { name: 'sergey prokofieff', id: 18 }];

        if ($.trim(params.term) === '') {
          return data;
        }

        for (var i = 0; i < altNames.length; i++) {
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
      $('.select-value').select2({ matcher: matchComposers });

      $('.select-value').on("select2:open", function () {
        console.log('opened');
        $('.select2-search__field').attr('placeholder', "Search for a composer...");
      });
      $('.select-value').on("select2:close", function () {
        $('.select2-search__field').attr('placeholder', null);
      });

      //function expects composer object
      //UGLY CODE. Does side-effects + and returns data. Refactor ASAP
      function calculateComposerSeasonData(composer, composerIndex) {
        var seasonsCount = [];

        composerWorks = [];
        ALL_SEASONS.forEach(function (season, season_idx) {
          var works = composer.works;
          //accumulates the # of pieces per season by one composer
          var seasonWorkCount = 0;
          works.forEach(function (work, work_idx) {
            var workSeasons = work.seasons;
            var numOfPerformances = workSeasons.length;

            if (workSeasons.includes(season)) {
              var workMetaData = {
                id: composerIndex + ":" + work_idx,
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
          seasonsCount.push({ count: seasonWorkCount, season: season });
        });
        return seasonsCount;
      }

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

        $('.composer-face').remove();
        var composer = composers[index].composer;
        var composerImage = composer === 'Strauss,  Johann, II' ? 'strauss_j.png' : composer.toLowerCase().split(' ')[0].match(/[a-z]*/)[0] + '.png';
        $('.composer-face-container').append("<img class='composer-face' src='assets/images/composer_sqs/" + composerImage + "'/>");
        if (currentType == 'dots') {
          renderDots(index);
        } else {
          //renderHeatMap.call(null, calculateGrid(calculateComposerSeasonData(composers[index], index), 20, 2), ...samples[3]);
        }
      }

      function renderDots(number) {
        var composer = composers[number];
        var composerWrapper = [composer];
        var composerIndex = number;
        var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
          return season.match(composer.birth);
        })];
        var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
          return season.match(composer.death);
        })];

        //Populate composerWorks array with works data
        calculateComposerSeasonData(composer, composerIndex);

        // Composer birth-death box transition
        var lifetimeBox = lifetime.select('rect').data(composerWrapper);
        var lifetimeBoxLine = lifetime.select('line').data(composerWrapper);

        lifetimeBox.transition().duration(1400).attr('x', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
        }).attr('width', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          var rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
          var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.death);
          })];
          var rectWidth = void 0;

          if (!seasonsScale(deathSeason)) {
            rectWidth = 0;
          } else {
            rectWidth = seasonsScale(deathSeason) - rectX;
          }
          return rectWidth;
        });

        lifetimeBoxLine.transition().duration(1400).attr('x1', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          return seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
        }).attr('x2', function (d) {
          var birthSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.birth);
          })];
          var deathSeason = ALL_SEASONS[ALL_SEASONS.findIndex(function (season) {
            return season.match(d.death);
          })];
          var rectX = seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43");
          var rectWidth = void 0;

          if (!seasonsScale(deathSeason)) {
            rectWidth = 0;
          } else {
            rectWidth = seasonsScale(deathSeason) - rectX;
          }

          return (seasonsScale(birthSeason) ? seasonsScale(birthSeason) : seasonsScale("1842-43")) + rectWidth;
        });

        //.attr('x1', rectX)
        //.attr('x2', rectX + rectWidth); 

        var dots = svg.select('.dots-grouping').selectAll('circle').data(composerWorks);

        dots.exit().remove();

        dots.transition().duration(1400).attr('r', seasonsScale.bandwidth() / 2.4).attr('cx', function (d) {
          return seasonsScale(d.season);
        }).attr('cy', function (d) {
          return yScale(d.seasonWorkCount);
        }).attr('fill', function (d) {
          if (d.orphanWork) return '#343434';
          if (d.firstPerf) return 'Tomato';else return '#3f74a1';
        }).attr('stroke', function (d) {
          if (d.orphanWork) return '#df644e';
        }).attr('opacity', 1).attr('stroke-width', 1).attr('r', seasonsScale.bandwidth() / 2.4).attr('class', function (d, i) {
          return "piece unid-" + i;
        });

        dots.enter().append('circle').attr('r', seasonsScale.bandwidth() / 2.4).attr('cx', function (d) {
          return seasonsScale(d.season);
        }).attr('cy', SVG_HEIGHT + 5).attr('class', function (d, i) {
          return "piece unid-" + i;
        }).transition().duration(1400).attr('r', seasonsScale.bandwidth() / 2.4).attr('cx', function (d) {
          return seasonsScale(d.season);
        }).attr('cy', function (d) {
          return yScale(d.seasonWorkCount);
        }).attr('fill', function (d) {
          if (d.orphanWork) return '#343434';
          if (d.firstPerf) return 'Tomato';else return '#3f74a1';
        }).attr('stroke', function (d) {
          if (d.orphanWork) return '#df644e';
        });

        //Voronoi inside renderDots; needs calculateComposerSeasonData to have been called
        voronoiOverlay.selectAll('path').remove();

        //min X seasonsScale(composerWorks[0].season) - 20
        //max X seasonsScale(composerWorks[composerWorks.length - 1].season) + 20
        //min Y SVG_HEIGHT*.92
        //max Y yScale(d3.max(composerWorks, work => work.seasonWorkCount))
        //TODO calculate new extents depending on composer
        //OLD: voronoiGen.extent([[SVG_WIDTH*.05, 0], [SVG_WIDTH*.95, SVG_HEIGHT*.92]]);
        voronoiGen.extent([[seasonsScale(composerWorks[0].season) - 7, yScale(d3.max(composerWorks, function (work) {
          return work.seasonWorkCount;
        })) - 7], [seasonsScale(composerWorks[composerWorks.length - 1].season) + 7, SVG_HEIGHT * .92]]);

        voronoiOverlay.selectAll('path').data(voronoiGen.polygons(composerWorks)).enter().append('path').attr('d', function (d) {
          return "M" + d.join("L") + "Z";
        }).attr('class', function (d, i) {
          return "piece unid-" + i;
        }).on('click', function (d, i) {
          var id = d.data.id;

          d3.selectAll('.piece').attr('stroke', function (d) {
            if (d.id == id) return 'white';
          }).attr('opacity', function (d) {
            if (d.id != id) return 0.4;else return 1;
          }).attr('r', seasonsScale.bandwidth() / 2.4).attr('stroke-width', 1);

          d3.select("circle.unid-" + i).attr('stroke-width', 3).attr('r', seasonsScale.bandwidth() / 1.5);
        }).on('mouseover', function (d, i) {
          var data = d.data;
          var dimensions = document.querySelector("circle.unid-" + i).getBoundingClientRect();

          var left = dimensions.right > svgDimensions.left + svgDimensions.width / 2 ? dimensions.right - 370 : dimensions.right + 20;
          var tooltip = d3.select('.tooltip').style('left', left + "px");
          //will be variable based on the text content
          var height = void 0;
          var id = "unid-" + i;
          var html = "<span class='tooltip-title'>" + data.title + "</span><br><span class='tooltip-content'><em>" + data.season + " season</em></span><br><span class='tooltip-content'>Appeared in " + data.seasonCount + " " + (data.seasonCount == 1 ? 'season' : 'seasons') + "</span><br><span class='tooltip-content'>" + (data.numOfPerfs / composerWorks.length * 100).toFixed(2) + "% of all performances of works by " + data.composer + "</span>";
          tooltip.html(html);
          //vertically center tooltip with the dot
          height = document.querySelector('.tooltip').getBoundingClientRect().height;
          tooltip.style('top', dimensions.top - Math.floor(height / 1.5) + "px");
          tooltip.transition().duration(500).style('opacity', .9);
          //d3.select(d3.event.target)
          //	.attr('stroke-width', 3)
          //	.attr('r', seasonsScale.bandwidth()/1.5); 
          d3.select("circle.unid-" + i).attr('stroke-width', 3).attr('r', seasonsScale.bandwidth() / 1.5);
        }).on('mouseout', function (d, i) {
          var tooltip = d3.select('.tooltip');
          tooltip.transition().duration(300).style('opacity', 0);
          d3.select("circle.unid-" + i).attr('stroke-width', 1).attr('r', seasonsScale.bandwidth() / 2.4);
        })
        //To see voronoi outline/dev env; comment out in production 
        //.style("stroke", "rgba(180, 180, 180, .5)")
        .style('pointer-events', 'all').style('fill', 'none');
      }

      //Initialize composers chart(s)
      if (!isMobile().any() && window.matchMedia("(min-width: 900px)").matches) {
        currentType = 'dots';
        setupDotChart();
        selectComposer(0);
      } else {
        currentType = 'mobile';
        //hide image + select 
        d3.select('.dot-chart-heading-middle').classed('hidden', true);
        setupMobileCharts();
        console.log(generateRandomComposer());
      }
    });
  }, { "../../temp_utils/generate_seasons.js": 3, "../../temp_utils/is-mobile.js": 4, "just-debounce-it": 2 }], 2: [function (require, module, exports) {
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
  }, {}], 3: [function (require, module, exports) {
    function generateSeasons(start, end) {
      var seasons = [];

      for (var i = start; i <= end; i++) {
        var nextSeas = String(i + 1).slice(2, 4);
        seasons.push(String(i + "-" + nextSeas));
      }

      return seasons;
    }

    module.exports = generateSeasons;
  }, {}], 4: [function (require, module, exports) {
    module.exports = isMobile;

    function isMobile() {
      return {
        android: function android() {
          return navigator.userAgent.match(/Android/i);
        },
        blackberry: function blackberry() {
          return navigator.userAgent.match(/BlackBerry/i);
        },
        ios: function ios() {
          return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        opera: function opera() {
          return navigator.userAgent.match(/Opera Mini/i);
        },
        windows: function windows() {
          return navigator.userAgent.match(/IEMobile/i);
        },
        any: function any() {
          return isMobile().android() || isMobile().blackberry() || isMobile().ios() || isMobile().opera() || isMobile().windows();
        }
      };
    }
  }, {}] }, {}, [1]);