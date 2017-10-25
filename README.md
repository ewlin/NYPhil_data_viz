# Data Visualization Project w/New York Philharmonic Historical Concert Data

### _(Updated 10/24/2017)_

### TODOs: 

#### BUGS: 
* Resizing issues [Mostly fixed, some scale issues, margins etc. remain]
* X-Axis ticks sometimes not showing up in AREA graph
* Trendline annotation needs to be removed earlier when scrolling upwards

#### TESTS: 
* Data processing/transforms code should be tested 
* Utility library code should be tested 

#### CODE: 

##### Mobile + Resizing
<<<<<<< HEAD
* Mobile detection scaffold/outline
* Mobile render code for Streamgraph (partially done)
* Window resize code (partially done)
* Heatmap alternative for mobile in place of dot chart 

##### Streamgraph
* *Add Seasons Axis to Stream/Area charts* [COMPLETED]
* *Add labeling to Stream/Area chart axes* [COMPLETED]
* (FINISHED) Add final chart to part one: percentage of all pieces that are repeat performances by living composers (area or line?) [COMPLETED]
* Annotations (A. on the side of chart + B. within chart) [COMPLETED]

##### Dot Chart 
* Legend (Orphan, NYPhil premiere, repeat performance)
* Fixed tooltip data for transitions [COMPLETED]
=======
* {PRIORITY} Mobile detection scaffold/outline
* Mobile render code for Streamgraph
* Window resize code [Some done; streamgraph paths completed, still need to fix relative margins]
* {PRIORITY} Heatmap alternative for mobile in place of dot chart (kinda like github commit heatmap)
* X-axis label needs to float and stay in the center (calculate)

##### Streamgraph
* *Add labeling to Stream/Area chart axes* [COMPLETED, fix x axis label positioning issue]
* Annotations (A. on the side of chart + B. within chart) [MOSTLY COMPLETED, need to add mobile sizes/scale code] 
* Add annotations of when some composers were born (Stravinsky, Mahler, Ravel, Debussy, Shostakovich, Rach etc.)
* Change y axis label on first chart to 'Number of UNIQUE compositions...' [COMPLETED]

##### Dot Chart 
* Legend (Orphan, NYPhil premiere, repeat performance) + Lifetime box
* Fixed tooltip data for transitions 
>>>>>>> resizing
* Annotations? 
* Optimize dot annotation rendering (cache some calculations?)

#### PROSE: 
* {PRIORITY} Methodology
* Introduction/Background
* {PRIORITY} Chart one explainations 
* {PRIORITY} Chart two explainations

#### Re-factoring: 

##### DATA/JSON files 
* Have some code for including data based on absolute number of performances and not just counting unique compositions

##### JS
* Modularize 
* Move things to utilities folder 

##### CSS

##### Assets 
* Collect remaining composer thumbnails 

#### Medium-term features: 
* Chart 3 design + code (Joy chart?)
* Linting
* Repo-cleaning (remove files not needed)

#### Possible additional routes: 

* Composer and Conductor nationalities
* NYPhil Tour data 