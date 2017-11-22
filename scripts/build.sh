browserify assets/js/stream_experiment.js -o bundle/streamBundle.js
browserify assets/js/dot_chart_new.js -o bundle/composerBundle.js

babel --presets es2015 bundle -d bundled-babel

uglifyjs bundled-babel/streamBundle.js -c -m -o min-scripts/streamBundle-min.js
uglifyjs bundled-babel/composerBundle.js -c -m -o min-scripts/composerBundle-min.js

date; echo; 