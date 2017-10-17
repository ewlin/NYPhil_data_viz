
//const SCROLLMAGIC = require('scrollmagic'); 
let controller = new ScrollMagic.Controller();
let containerScroll = document.querySelector('.outer-container'); 

let scene = new ScrollMagic.Scene({
																	 triggerElement: ".outer-container", 
																	 duration: containerScroll.offsetHeight - window.innerHeight, 
																	 triggerHook: 0
																	})
					.addTo(controller);

let prose0 = new ScrollMagic.Scene({
																	 triggerElement: ".explain1", 
																	 duration: 500, 
																	 triggerHook: .5
																	})
						.addTo(controller);

let prose1 = new ScrollMagic.Scene({
																	 triggerElement: ".explain2", 
																	 duration: 500, 
																	 triggerHook: .5
																	})
						.addTo(controller);

let prose2 = new ScrollMagic.Scene({
																	 triggerElement: ".explain3", 
																	 duration: 500, 
																	 triggerHook: .5
																	})
						.addTo(controller);

let prose3 = new ScrollMagic.Scene({
																	 triggerElement: ".explain4", 
																	 duration: 500, 
																	 triggerHook: .5
																	})
						.addTo(controller);


scene.on('enter', () => {
	console.log("fixed"); 
	$('.inner-container').addClass("fixed"); 
});  

scene.on('leave', (e) => {
	console.log('exit scene'); 
	$('.inner-container').removeClass("fixed"); 
	if (e.scrollDirection === 'FORWARD') {
		$('.inner-container').addClass('at-bottom'); 
	} else {
		$('.inner-container').removeClass('at-bottom'); 
	}
}); 

prose0.on('enter', () => {
	//console.log("first"); 
	transitionOrg(); 
}); 

prose1.on('enter', () => {
	//console.log("second"); 
	transition(); 
}); 

prose2.on('enter', () => {
	//console.log("third"); 
	transition2(); 
}); 

prose3.on('enter', () => {
	//console.log("fourth"); 
	transition3(); 
}); 