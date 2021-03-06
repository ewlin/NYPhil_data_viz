"use strict";

/* const ALL_SEASONS = [  
   "1842-43",
   "1843-44",
	 "1844-45",
   "1845-46",
   "1846-47",
   "1847-48",
   "1848-49",
   "1849-50",
   "1850-51",
   "1851-52",
   "1852-53",
   "1853-54",
   "1854-55",
   "1855-56",
   "1856-57",
   "1857-58",
   "1858-59",
   "1859-60",
   "1860-61",
   "1861-62",
   "1862-63",
   "1863-64",
   "1864-65",
   "1865-66",
   "1866-67",
   "1867-68",
   "1868-69",
   "1869-70",
   "1870-71",
   "1871-72",
   "1872-73",
   "1873-74",
   "1874-75",
   "1875-76",
   "1876-77",
   "1877-78",
   "1878-79",
   "1879-80",
   "1880-81",
   "1881-82",
   "1882-83",
   "1883-84",
   "1884-85",
   "1885-86",
   "1886-87",
   "1887-88",
   "1888-89",
   "1889-90",
   "1890-91",
   "1891-92",
   "1892-93",
   "1893-94",
   "1894-95",
   "1895-96",
   "1896-97",
   "1897-98",
   "1898-99",
   "1899-00",
   "1900-01",
   "1901-02",
   "1902-03",
   "1903-04",
   "1904-05",
   "1905-06",
   "1906-07",
   "1907-08",
   "1908-09",
   "1909-10",
   "1910-11",
   "1911-12",
   "1912-13",
   "1913-14",
   "1914-15",
   "1915-16",
   "1916-17",
   "1917-18",
   "1918-19",
   "1919-20",
   "1920-21",
   "1921-22",
   "1922-23",
   "1923-24",
   "1924-25",
   "1925-26",
   "1926-27",
   "1927-28",
   "1928-29",
   "1929-30",
   "1930-31",
   "1931-32",
   "1932-33",
   "1933-34",
   "1934-35",
   "1935-36",
   "1936-37",
   "1937-38",
   "1938-39",
   "1939-40",
	 "1940-41",
   "1941-42",
   "1942-43",
   "1943-44",
   "1944-45",
   "1945-46",
   "1946-47",
   "1947-48",
   "1948-49",
   "1949-50",
   "1950-51",
   "1951-52",
   "1952-53",
   "1953-54",
   "1954-55",
   "1955-56",
   "1956-57",
   "1957-58",
   "1958-59",
   "1959-60",
   "1960-61",
   "1961-62",
   "1962-63",
   "1963-64",
   "1964-65",
   "1965-66",
   "1966-67",
   "1967-68",
   "1968-69",
   "1969-70",
   "1970-71",
   "1971-72",
   "1972-73",
   "1973-74",
   "1974-75",
   "1975-76",
   "1976-77",
	 "1977-78",
   "1978-79",
   "1979-80",
   "1980-81",
   "1981-82",
   "1982-83",
   "1983-84",
   "1984-85",
   "1985-86",
   "1986-87",
   "1987-88",
   "1988-89",
   "1989-90",
   "1990-91",
   "1991-92",
   "1992-93",
   "1993-94",
   "1994-95",
   "1995-96",
   "1996-97",
	 "1997-98",
   "1998-99",
	 "1999-00",
   "2000-01",
   "2001-02",
   "2002-03",
   "2003-04",
   "2004-05",
   "2005-06",
   "2006-07",
   "2007-08",
   "2008-09",
   "2009-10",
   "2010-11",
   "2011-12",
   "2012-13",
   "2013-14",
   "2014-15",
   "2015-16",
   "2016-17"
]; 

*/

var BAR_HEIGHT = 45;

var composersByTotal = [];

var composerArray = void 0;
var composersByFirstSeason = void 0;

var transitionBar = function transitionBar() {};
var screen_height = window.outerHeight;

d3.json('../../data/top60_alt.json', function (composers) {

  var SVG_WIDTH = 1200;
  console.log(composers);

  //TODO some redundant code here. Clean up 
  composers.forEach(function (composer) {
    var works = composer.works;
    var worksByYears = { composer: composer.composer, seasons: {}, firstSeason: null };
    ALL_SEASONS.forEach(function (season) {
      var worksPerSeason = works.reduce(function (total, work) {
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
  composersArray = composersByTotal.map(function (composer) {
    var composerSeasonsArr = [];
    var composerSeasons = composer.seasons;

    for (var s in composerSeasons) {
      composerSeasonsArr.push({ season: s, count: composerSeasons[s] });
    }

    return { composer: composer.composer, seasons: composerSeasonsArr, firstSeason: composer.firstSeason };
  });

  composersByFirstSeason = composersArray.slice().sort(function (a, b) {
    return parseInt(a.firstSeason) - parseInt(b.firstSeason);
  });

  console.log(composersArray);
  //scale to determine where bar goes for each season 
  var x = d3.scaleBand().domain(ALL_SEASONS).range([0, 1050]).padding(.1);

  var densityScale = d3.scalePow().exponent(.8).domain([0, 30]).range([0, 1]);

  var axisYears = d3.axisTop(x).tickValues(x.domain().filter(function (season, i) {
    var S = ["1850-51", "1875-76", "1900-01", "1925-26", "1950-51", "1975-76", "2000-01"];
    return S.includes(season);
  })).tickSize(screen_height);

  var axis = d3.select("body").select(".heat-container").append("svg").attr("class", "axis").attr("width", SVG_WIDTH).attr("height", screen_height).attr("x", 0).attr("y", 0).append("g").attr("transform", "translate(-" + x.bandwidth() / 2 + "," + (screen_height + 20) + ")").call(axisYears);

  axis.selectAll("text").attr("fill", "white").attr("font-size", "15px");
  axis.select(".domain").remove();

  d3.select("body").selectAll(".tick").select("line").attr("stroke", "White").attr("stroke-dasharray", "2,2");

  var SVG = d3.select(".heat-container").append("svg").attr("class", "main-svg").attr("x", 0).attr("y", 0).attr("width", SVG_WIDTH).attr("height", composers.length * BAR_HEIGHT + 50);

  var bars = SVG.selectAll(".composer").data(composersArray).enter().append("g").attr("class", "composer-bar").attr("transform", function (d, i) {
    return "translate(0," + i * BAR_HEIGHT + ")";
  });

  bars.selectAll(".season").data(function (d) {
    return d.seasons;
  }).enter().append("rect").attr("y", 0).attr("x", function (d) {
    return x(d.season);
  }).attr("height", BAR_HEIGHT).attr("width", x.bandwidth).attr("fill", "Tomato").attr("fill-opacity", function (d) {
    return densityScale(d.count);
  });

  ////Borders around works that have 5+ performances
  //.attr("stroke", "#369c9c")
  ////.attr("stroke-width", d => d.count >= 10 ? 2 : 0)
  //.attr("stroke-width", d => d.season >= "2007-08" && d.count > 0 ? 2 : 0)
  //.attr("stroke-opacity", 0.7)

  bars.append("text").attr("class", "composer-name").text(function (d) {
    var c = d.composer.split("  ");
    var first = c[0].match(/\[.*\]/) ? c[0].match(/\[.*\]/)[0].slice(1, c[0].match(/\[.*\]/)[0].length - 1) : c[0];
    return first + " " + c[1].trim().slice(0, 1) + ".";
  }).attr("transform", "translate(1060, 27)").attr("fill", "White").attr("font-family", "Arial").attr("font-size", "14px");

  //console.log(SVG.selectAll(".composer-bar").sort(function(a, b) { return x0(a.letter) - x0(b.letter) })); 


  transitionBar = function transitionBar(newData, color) {

    bars.data(newData).transition().duration(0);

    bars.selectAll("rect").data(function (d) {
      return d.seasons;
    }).transition().duration(1200).attr("fill", color).attr("fill-opacity", function (d) {
      return densityScale(d.count);
    });
    //.attr("stroke", "#369c9c")
    ////.attr("stroke-width", d => d.count >= 10 ? 2 : 0)
    //.attr("stroke-width", d => d.season >= "2007-08" && d.count > 0 ? 2 : 0)
    //.attr("stroke-opacity", 0.7);

    bars.select(".composer-name").transition().duration(1200).text(function (d) {
      var c = d.composer.split(",");
      var first = c[0].match(/\[.*\]/) ? c[0].match(/\[.*\]/)[0].slice(1, c[0].match(/\[.*\]/)[0].length - 1) : c[0];
      return first + ", " + c[1].trim().slice(0, 1) + ".";
    });
  };

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
  return composersArr.reduce(function (max, composer) {
    var seasons = composer.seasons;
    var highest = 0;
    for (var season in seasons) {
      highest = seasons[season] > highest ? seasons[season] : highest;
    }
    return max > highest ? max : highest;
  }, 0);
}