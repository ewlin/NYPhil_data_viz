'use strict';

d3.json('beethoven.json', function (d) {
	console.log(d);
	var categories = [];
	d.works.forEach(function (work) {
		if (!categories.includes(work.category)) categories.push(work.category);
	});

	console.log(categories);

	var svg = d3.select('svg'); //.attr("width", window.innerWidth).attr("height", window.innerHeight); 

	var margin = { top: 20, right: 20, bottom: 30, left: 50 };
	var svgWidth = +svg.attr("width") - margin.left - margin.right;
	var svgHeight = +svg.attr("height") - margin.top - margin.bottom;
	var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	var colorIndex = d3.scaleOrdinal(d3.schemeCategory20).domain(categories);

	var y = d3.scaleLinear().domain([0, categories.length]).range([0, svgHeight / 3 * 2]);

	var node = d3.hierarchy(d, function (d) {
		return d.works;
	}).sum(function (d) {
		return d.seasonCount;
	});
	var pack = d3.pack().size([svgHeight, svgHeight]);
	//console.log((pack(node)).descendants()); 
	g.append("g").selectAll(".work").data(pack(node).descendants().slice(1)).enter().append("g").attr("class", "circle").append("circle").attr("class", function (d) {
		return d.children ? "parent node" : "leaf node";
	}).attr("r", function (d) {
		return d.r;
	}).attr("transform", function (d) {
		return "translate(" + d.x + "," + d.y + ")";
	}).attr("fill", function (d) {
		return colorIndex(d.data.category);
	}).attr("opacity", 0.85).on("mouseover", function (d, i, nodes) {
		console.log(d);
		//g.select("g")
		//	.append("rect")
		//	.attr("width", "50")
		//	.attr("height", "50")
		//	.attr("fill", "White")
		//	.attr("y", d.y + 30)
		//	.attr("x", d.x + 30); 
		g.select("g").append("text").attr("y", 0).attr("x", 0).attr("fill", "White").text(d.data.title);
	}).on("mouseout", function () {
		//g.select("g").select("rect").remove(); 
		g.select("g").select("text").remove();
	});

	console.log(g.selectAll("circle"));

	var legend = svg.append("g").attr("transform", "translate(" + (svgHeight + margin.left) + ",100)").attr("class", "graphLegend").selectAll(".legend").data(categories).enter().append("g").attr("class", "category")
	//TODO: Redo to add and remove classes rather than directly manipulate opacity attr
	.on("click", function (d, i, nodes) {
		var category = d;
		d3.selectAll(".leaf").attr("opacity", function (d) {
			return d.data.category === category ? 0.95 : 0.1;
		});
		d3.selectAll("rect").attr("stroke-width", "0px");
		d3.select(nodes[i]).selectAll("rect").attr("stroke", function (d) {
			return colorIndex(d);
		}).attr("stroke-opacity", 1).attr("stroke-width", "3px");
	});

	legend.append("rect").attr("x", 10).attr("y", function (d, i) {
		return y(i);
	}).attr("width", 50).attr("height", 15).attr("fill", function (d) {
		return colorIndex(d);
	}).attr("fill-opacity", .65);

	legend.append("text").text(function (d) {
		return d.toUpperCase();
	}).attr("y", function (d, i) {
		return y(i);
	}).attr("x", 70).attr("font-family", "Arial").attr("font-size", "9px").attr("transform", "translate(0,11)").attr("fill", function (d) {
		return colorIndex(d);
	});
});