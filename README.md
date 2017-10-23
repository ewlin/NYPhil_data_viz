# Data Visualization Project w/New York Philharmonic Historical Concert Data

### _(Updated 10/05/2017)_

### TODOs: 

#### BUGS: 
* Resizing issues 
* X-Axis ticks sometimes not showing up in AREA graph
* Trendline annotation needs to be removed earlier when scrolling upwards

#### TESTS: 
* Data processing/transforms code should be tested 
* Utility library code should be tested 

#### CODE: 

##### Mobile + Resizing
* Mobile detection scaffold/outline
* Mobile render code for Streamgraph
* Window resize code
* Heatmap alternative for mobile in place of dot chart (kinda like github commit heatmap)

##### Streamgraph
* *Add Seasons Axis to Stream/Area charts* [COMPLETED]
* *Add labeling to Stream/Area chart axes* [COMPLETED]
* Add final chart to part one: percentage of all pieces that are repeat performances by living composers (area or line?) [COMPLETED]
* Annotations (A. on the side of chart + B. within chart) [MOSTLY COMPLETED]
* Add annotations of when some composers were born (Stravinsky, Mahler, Ravel, Debussy, Shostakovich, Rach etc.)
* Change y axis label on first chart to 'Number of UNIQUE compositions...' [COMPLETED]

##### Dot Chart 
* Legend (Orphan, NYPhil premiere, repeat performance) + Lifetime box
* Fixed tooltip data for transitions 
* Annotations? 
* Optimize dot annotation rendering (cache some calculations?)

#### PROSE: 
* Methodology
* Introduction/Background
* Chart one explainations 
* Chart two explainations

#### Re-factoring: 

##### DATA/JSON files 

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