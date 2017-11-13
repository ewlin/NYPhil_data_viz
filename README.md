# Data Visualization Project w/New York Philharmonic Historical Concert Data

### _(Updated 11/13/2017)_

## TODOs: 

### BUGS: 

### GENERAL: 
* Babelfy everything so works on older browsers

### INTRO
* Prose. Finish writing last paragraph to intro. Talk about repeat/first-time and alive/dead as metrics 

### AREA GRAPHS
#### CODE: GENERAL 
* Resize for second chart (with 1909-10 annotation) needs to add/remove annotation based on screen width 
* Fix Axis label text when vertically compressed charts (e.g. Instead of 'Percentage of' say '% of')
#### CODE: MOBILE
* Fix master branch mobile resize (remove !isMobile()...code)
* Resize should not redraw trendline in mobile


#### PROSE
* Talk about sources of noise ()
* Finish (.explain p) for living/dead panel
* Finish .trendline explain panel 
* Finish stream graph final panel (conclusion)
* Finish transition from stream to composers 


### TOP 59 COMPOSERS GRAPH
#### CODE: JS

* check if new code (meta tag info) fixes zooming issue when select is focused (in mobile)
* Auto-select value in select with JS when composer name clicked. Current code not working in mobile Safari or mobile Chrome on iOS [Added changes on 11/11; test to see works]
* Select element style weird in mobile/consider removing styling for mobile
* Add rank + number of performances for each composer
* Smooth scrolling when composer name is clicked (if possible)

* Code Heatmap (Legend, layout, lifetime border)
* Add d3-voronoi to Dot chart
* Dot chart resize
* Dot chart margins and height determined by calculations 
* Dot chart legend (dot colors + lifetime box)

* Optimize dot annotation rendering (cache some calculations?)?????


#### Methodology 

* Mobile sizing








[OLD TO-DOs- Pre ~11/5/17]
#### BUGS: 
* Resizing issues [Mostly fixed, some scale issues, margins etc. remain--COMPLETED on STREAMGRAPH]
* X-Axis ticks sometimes not showing up in AREA graph [COMPLETED]
* Trendline annotation needs to be removed earlier when scrolling upwards [COMPLETED]
* [Issue A] Streamgraph/area graph height needs to be calculated a bit better to make it mostly 100% height when fixed. including graphic title; otherwise weird bug when height overflows to bottom since graphic title is not calculated using a percentage of innerHeight. (11/5 bug) WEIRD FLASHING ISSUE with mobile; flicker [FIXED BOTH; see https://stanko.github.io/ios-safari-scoll-position-fixed/]
* IDEA: calculate container (the fixed thing's height using window.innerHeight() ) [COMPLETED]

* FIX d3 annotation bug when refreshing from lower in the document; arrowhead appears as an artifact [Completed, scraped arrow]

#### TESTS: 
* Data processing/transforms code should be tested 
* Utility library code should be tested 

#### CODE: 

##### Orchestra + Composers relative timeline
* Design
* Grab assets (orch logos)
* Code
* Mobile resizing

##### Mobile + Resizing
* {PRIORITY} Mobile detection scaffold/outline
* Mobile render code for Streamgraph [MOSTLY DONE]
* Window resize code [MOSTLY DONE]
* {PRIORITY} Heatmap alternative for mobile in place of dot chart (kinda like github commit heatmap) (Started)

* X-axis label needs to float and stay in the center (calculate) [COMPLETED]
* Y-axis label rewrite when vertically resized 

##### Streamgraph
*   Add labeling to Stream/Area chart axes* [COMPLETED/DONE]
*   Annotations (A. on the side of chart + B. within chart) [MOSTLY COMPLETED, need to add mobile sizes/scale code]     UPDATE (10/31/07, REMOVED ANNOTATIONS ON SIDE; make legend instead; LEGEND COMPLETED; consider some design         changes?) MOSTLY DONE
*   Add annotations of when some composers were born (Stravinsky, Mahler, Ravel, Debussy, Shostakovich, Rach etc.) (MOVE THIS TO ORCHESTRA TIMELINE aka other orchs)
*   Change y axis label on first chart to 'Number of UNIQUE compositions...' [COMPLETED]
*   Streamgraph vertical spacing (with graph title) [see bug issue A-COMPLETED]

##### Dot Chart 
* Legend (Orphan, NYPhil premiere, repeat performance) + Lifetime box
* Fixed tooltip data for transitions [COMPLETED]
* Annotations? [Nah] 
* Optimize dot annotation rendering (cache some calculations?)
* Add d3-voronoi overlay to make for better interactions
* Use Element.scrollIntoView() and make a clickable list of composers {PRIORITY} [COMPLETED]

#### PROSE: 
* {PRIORITY} Methodology
* Introduction/Background [Almost complete]
* {PRIORITY} Chart one explainations [rewrote much of it]
* {PRIORITY} Chart two explainations [write prose, started; needs fixing]

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