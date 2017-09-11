//const SCROLLMAGIC = require('scrollmagic'); 
let controller = new ScrollMagic.Controller();

let scene = new ScrollMagic.Scene({triggerElement: "#test-container", 
																	 duration: 500})
					.addTo(controller);



scene.on('enter', () => {
	console.log("fixed"); 
	$('#test-container').addClass("fixed"); 
});  

