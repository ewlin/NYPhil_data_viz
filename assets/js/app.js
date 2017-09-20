//const SCROLLMAGIC = require('scrollmagic'); 
let controller = new ScrollMagic.Controller();

let scene = new ScrollMagic.Scene({
																	 triggerElement: ".outer-container", 
																	 duration: 1200, 
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


scene.on('enter', () => {
	console.log("fixed"); 
	$('.container').addClass("fixed"); 
});  

prose0.on('enter', () => {
	console.log("first"); 
	transitionOrg(); 
}); 

prose1.on('enter', () => {
	console.log("first"); 
	transition(); 
}); 

prose2.on('enter', () => {
	console.log("first"); 
	transition2(); 
})