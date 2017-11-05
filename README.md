# Data Visualization Project w/New York Philharmonic Historical Concert Data

### _(Updated 11/5/2017)_

### TODOs: 

#### BUGS: 
* Resizing issues [Mostly fixed, some scale issues, margins etc. remain]
* X-Axis ticks sometimes not showing up in AREA graph [COMPLETED; issue with shape-rendering property on axis, see: https://github.com/d3/d3/issues/2175]
* Trendline annotation needs to be removed earlier when scrolling upwards [COMPLETED]
* [Issue A] Streamgraph/area graph height needs to be calculated a bit better to make it mostly 100% height when fixed. including graphic title; otherwise weird bug when height overflows to bottom since graphic title is not calculated using a percentage of innerHeight. (11/5 bug)

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
* Mobile render code for Streamgraph
* Window resize code [Some done; streamgraph paths completed, still need to fix relative margins]
* {PRIORITY} Heatmap alternative for mobile in place of dot chart (kinda like github commit heatmap)

* X-axis label needs to float and stay in the center (calculate) [COMPLETED]

##### Streamgraph
*   Add labeling to Stream/Area chart axes* [COMPLETED, fix x axis label positioning issue]
*   Annotations (A. on the side of chart + B. within chart) [MOSTLY COMPLETED, need to add mobile sizes/scale code]     UPDATE (10/31/07, REMOVED ANNOTATIONS ON SIDE; make legend instead) 
*   Add annotations of when some composers were born (Stravinsky, Mahler, Ravel, Debussy, Shostakovich, Rach etc.)
*   Change y axis label on first chart to 'Number of UNIQUE compositions...' [COMPLETED]
*   Streamgraph vertical spacing (with graph title) [see bug issue A]

##### Dot Chart 
* Legend (Orphan, NYPhil premiere, repeat performance) + Lifetime box
* Fixed tooltip data for transitions [COMPLETED]
* Annotations? [Nah]
* Optimize dot annotation rendering (cache some calculations?)
* Use Element.scrollIntoView() and make a clickable list of composers

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