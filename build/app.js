"use strict";

//const SCROLLMAGIC = require('scrollmagic'); 
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