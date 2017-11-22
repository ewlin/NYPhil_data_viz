"use strict";!function t(e,n,r){function a(i,s){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!s&&c)return c(i,!0);if(o)return o(i,!0);var d=new Error("Cannot find module '"+i+"'");throw d.code="MODULE_NOT_FOUND",d}var l=n[i]={exports:{}};e[i][0].call(l.exports,function(t){var n=e[i][1][t];return a(n||t)},l,l.exports,t,e,n,r)}return n[i].exports}for(var o="function"==typeof require&&require,i=0;i<r.length;i++)a(r[i]);return a}({1:[function(t,e,n){function r(t){var e=t.split(","),n=void 0,r=e[1].trim().split(" ").filter(function(t){return!!t}).join(" "),a=(n=e[0].match(/\[.*\]/))?n[0].substr(1,n[0].length-2):e[0];return 3===e.length?(r+" "+a+" II").trim():(r+" "+a).trim()}var a=t("../../temp_utils/generate_seasons.js"),o=t("../../temp_utils/is-mobile.js"),i=t("just-debounce-it"),s=a(1842,2016),c=void 0,d=[],l=void 0;d3.json("../../data/new_top60.json",function(t){function e(){p=$(".main-container").innerWidth(),v=.75*$(window).innerHeight(),k=d3.select(".main-container").append("svg").attr("class","composers-chart-container").attr("width",p).attr("height",v),(I=k.append("g").attr("class","axis axis-years").attr("transform","translate("+-x.bandwidth()/2.4+",0)").call(b)).select(".domain").remove(),I.selectAll(".tick line").style("stroke","White").style("stroke-dasharray","8,3"),I.selectAll("text").style("text-anchor",function(t){return"1842-43"===t||"2016-17"===t?"middle":"start"}),I.selectAll(".tick text").attr("transform","translate(0,"+.015*v+")"),I.append("text").attr("class","axis-label x-axis-label").text("NEW YORK PHILHARMONIC SUBSCRIPTION SEASONS").attr("text-anchor","middle").attr("x",.5*p).attr("transform","translate(0,"+.995*v+")"),(C=k.append("g").attr("class","axis axis-freq").attr("transform","translate("+.05*p+",0)").call(w)).select(".domain").remove(),C.append("text").attr("class","axis-label").text("NUMBER OF COMPOSITIONS PER SEASON").attr("transform","rotate(-90)").attr("dy",.03*-p),C.selectAll(".tick").select("line").attr("stroke","White").attr("stroke-dasharray","2,2");var t=x("1842-43");(A=k.append("g").attr("class","lifetime-box")).append("rect").attr("x",t).attr("y",0).attr("width",0).attr("height",.92*v).attr("opacity",.2).attr("fill","grey"),A.append("line").attr("x1",t).attr("x2",t+0).attr("y1",0).attr("y2",0).attr("stroke","#ff645f").attr("stroke-width","10"),S=k.append("g").attr("class","dots-grouping"),W=k.append("g").attr("class","voronoi-overlay"),c=document.getElementsByClassName("composers-chart-container")[0].getBoundingClientRect(),d3.select("body").append("div").attr("class","tooltip").style("opacity",0)}function n(){var e=function(){var e=[];return t.forEach(function(t,n){e.push(function(t,e){var n=[];return s.forEach(function(e,r){var a=0;t.works.forEach(function(t,n){var r=t.seasons;r.length,r.includes(e)&&++a}),n.push({count:a,season:e})}),{composer:t.composer,birth:t.birth,death:t.death,seasons:n}}(t))}),e}();E=d3.select(".main-container").append("section").attr("class","composer-charts"),M=$(".composer-charts").innerWidth()-B.left-B.right,L=d3.scaleBand().domain(s).range([0,M]),j=d3.axisBottom(L).tickValues(x.domain().filter(function(t,e){return["1842-43","2016-17"].includes(t)})).tickSize(0),P=d3.area().curve(d3.curveCardinal.tension(.1)).x(function(t){return L(t.season)}).y0(function(t){return 0}).y1(function(t){return q(t.count)}),e.forEach(function(t,e){var n=E.append("div").attr("class","composer-bar");n.append("svg").attr("class","composer-bar-svg").attr("id","composer"+e).attr("width",M+B.left+B.right).attr("height",O+B.top+B.bottom);n.append("p").html(r(t.composer)+" ("+t.birth+"-"+t.death+")");var a={birth:t.birth,death:t.death};d3.select("#composer"+e).append("rect").datum(a).attr("height",O).attr("opacity",.2).attr("y",0).attr("fill","grey").attr("transform","translate("+B.left+", "+B.top+")").attr("x",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return L(L(e)?e:"1842-43")}).attr("width",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})],n=L(L(e)?e:"1842-43"),r=s[s.findIndex(function(e){return e.match(t.death)})];return L(r)?L(r)-n:0}),d3.select("#composer"+e).append("line").datum(a).attr("x1",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return L(L(e)?e:"1842-43")}).attr("x2",function(t){var e=s[s.findIndex(function(e){return e.match(t.death)})];return L(e)?L(e):0}).attr("y1",0).attr("y2",0).attr("stroke","#ff645f").attr("stroke-width","6").attr("transform","translate("+B.left+", "+(B.top+3)+")"),d3.select("#composer"+e).append("path").datum(t.seasons).attr("d",P).attr("fill","none").attr("stroke","steelblue").attr("transform","translate("+B.left+", "+B.top+")");d3.select("#composer"+e).append("g").attr("class","composer-bar-axis").attr("transform","translate("+B.left+", "+B.top+")").call(N).select(".domain").remove();var o=d3.select("#composer"+e).append("g").attr("class","composer-bar-axis composer-bar-axis-x").attr("transform","translate("+B.left+", "+(B.top+O)+")").call(j);o.select(".domain").remove(),o.selectAll(".tick text").attr("transform","translate(0, "+B.bottom/3+")").style("text-anchor",function(t){return"1842-43"===t?"start":"2016-17"===t?"end":void 0})})}function a(){p=$(".main-container").innerWidth(),v=.75*$(window).innerHeight(),k.attr("width",p).attr("height",v),c=document.getElementsByClassName("composers-chart-container")[0].getBoundingClientRect(),x.range([.05*p,.95*p]),g.range([.92*v,0]),y.x(function(t){return x(t.season)}).y(function(t){return g(t.seasonWorkCount)}).extent([[x(d[0].season)-7,g(d3.max(d,function(t){return t.seasonWorkCount}))-7],[x(d[d.length-1].season)+7,.92*v]]),b=d3.axisBottom(x).tickSize(.92*v).tickValues(x.domain().filter(function(t,e){return window.innerWidth>=1100?["1842-43","1850-51","1875-76","1900-01","1925-26","1950-51","1975-76","2000-01","2016-17"].includes(t):["1850-51","1900-01","1950-51","2000-01"].includes(t)})),w=d3.axisLeft(g).ticks(5).tickSize(.009*p);var t=k.select(".axis-years").attr("transform","translate("+-x.bandwidth()/2.4+",0)").call(b);t.select(".domain").remove(),t.selectAll(".tick line").style("stroke","White").style("stroke-dasharray","8,3"),t.selectAll("text").style("text-anchor",function(t){return"1842-43"===t||"2016-17"===t?"middle":"start"}),t.selectAll(".tick text").attr("transform","translate(0,"+.015*v+")"),t.select(".x-axis-label").style("text-anchor","middle").attr("x",.5*p).attr("transform","translate(0,"+.995*v+")");var e=k.select(".axis-freq").attr("transform","translate("+.05*p+",0)").call(w);e.select(".domain").remove(),e.selectAll(".tick").select("line").attr("stroke","White").attr("stroke-dasharray","2,2");k.select(".dots-grouping").selectAll("circle").transition().duration(500).attr("r",x.bandwidth()/2.4).attr("cx",function(t){return x(t.season)}).attr("cy",function(t){return g(t.seasonWorkCount)}),W.selectAll("path").data(y.polygons(d)).transition().duration(500).attr("d",function(t){return"M"+t.join("L")+"Z"}),A.select("rect").transition().duration(500).attr("x",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return x(x(e)?e:"1842-43")}).attr("width",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})],n=x(x(e)?e:"1842-43"),r=s[s.findIndex(function(e){return e.match(t.death)})];return x(r)?x(r)-n:0}).attr("height",.92*v),A.select("line").transition().duration(500).attr("x1",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return x(x(e)?e:"1842-43")}).attr("x2",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})],n=s[s.findIndex(function(e){return e.match(t.death)})],r=x(x(e)?e:"1842-43"),a=void 0;return a=x(n)?x(n)-r:0,x(x(e)?e:"1842-43")+a})}function u(){M=$(".composer-charts").innerWidth()-B.left-B.right,L=d3.scaleBand().domain(s).range([0,M]),j=d3.axisBottom(L).tickValues(x.domain().filter(function(t,e){return["1842-43","2016-17"].includes(t)})).tickSize(0),P.x(function(t){return L(t.season)});var t=d3.selectAll(".composer-bar-svg");t.transition().duration(500).attr("width",M+B.left+B.right),t.select("path").transition().duration(500).attr("d",P);t.select(".composer-bar-axis-x").transition().duration(500).attr("transform","translate("+B.left+", "+(B.top+O)+")").call(j).select(".domain").remove(),t.select("rect").transition().duration(500).attr("x",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return L(L(e)?e:"1842-43")}).attr("width",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})],n=L(L(e)?e:"1842-43"),r=s[s.findIndex(function(e){return e.match(t.death)})];return L(r)?L(r)-n:0}),t.select("line").attr("x1",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return L(L(e)?e:"1842-43")}).attr("x2",function(t){var e=s[s.findIndex(function(e){return e.match(t.death)})];return L(e)?L(e):0})}function f(t){$(".select-value").val(t),$(".select-value").trigger("change"),h(t)}function h(e){$(".composer-face").remove();var n=t[e].composer,r="Strauss,  Johann, II"===n?"strauss_j.png":n.toLowerCase().split(" ")[0].match(/[a-z]*/)[0]+".png";$(".composer-face-container").append("<img class='composer-face' src='assets/images/composer_sqs/"+r+"'/>"),"dots"==l&&m(e)}function m(e){var n=t[e],r=[n],a=e;s[s.findIndex(function(t){return t.match(n.birth)})],s[s.findIndex(function(t){return t.match(n.death)})];!function(t,e){var n=[];d=[],s.forEach(function(r,a){var o=0;t.works.forEach(function(t,n){var a=t.seasons,i=a.length;if(a.includes(r)){var s={id:e+":"+n,title:t.title,season:r,seasonWorkCount:++o,seasonCount:t.seasonCount,numOfPerfs:i,composer:t.composer};1===a.length?s.orphanWork=!0:0===a.indexOf(r)&&(s.firstPerf=!0),d.push(s)}}),n.push({count:o,season:r})})}(n,a);var o=A.select("rect").data(r),i=A.select("line").data(r);o.transition().duration(1400).attr("x",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return x(x(e)?e:"1842-43")}).attr("width",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})],n=x(x(e)?e:"1842-43"),r=s[s.findIndex(function(e){return e.match(t.death)})];return x(r)?x(r)-n:0}),i.transition().duration(1400).attr("x1",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})];return x(x(e)?e:"1842-43")}).attr("x2",function(t){var e=s[s.findIndex(function(e){return e.match(t.birth)})],n=s[s.findIndex(function(e){return e.match(t.death)})],r=x(x(e)?e:"1842-43"),a=void 0;return a=x(n)?x(n)-r:0,x(x(e)?e:"1842-43")+a});var l=k.select(".dots-grouping").selectAll("circle").data(d);l.exit().remove(),l.transition().duration(1400).attr("r",x.bandwidth()/2.4).attr("cx",function(t){return x(t.season)}).attr("cy",function(t){return g(t.seasonWorkCount)}).attr("fill",function(t){return t.orphanWork?"#343434":t.firstPerf?"Tomato":"#3f74a1"}).attr("stroke",function(t){if(t.orphanWork)return"#df644e"}).attr("opacity",1).attr("stroke-width",1).attr("r",x.bandwidth()/2.4).attr("class",function(t,e){return"piece unid-"+e}),l.enter().append("circle").attr("r",x.bandwidth()/2.4).attr("cx",function(t){return x(t.season)}).attr("cy",v+5).attr("class",function(t,e){return"piece unid-"+e}).transition().duration(1400).attr("r",x.bandwidth()/2.4).attr("cx",function(t){return x(t.season)}).attr("cy",function(t){return g(t.seasonWorkCount)}).attr("fill",function(t){return t.orphanWork?"#343434":t.firstPerf?"Tomato":"#3f74a1"}).attr("stroke",function(t){if(t.orphanWork)return"#df644e"}),W.selectAll("path").remove(),y.extent([[x(d[0].season)-7,g(d3.max(d,function(t){return t.seasonWorkCount}))-7],[x(d[d.length-1].season)+7,.92*v]]),W.selectAll("path").data(y.polygons(d)).enter().append("path").attr("d",function(t){return"M"+t.join("L")+"Z"}).attr("class",function(t,e){return"piece unid-"+e}).on("click",function(t,e){var n=t.data.id;d3.selectAll(".piece").attr("stroke",function(t){if(t.id==n)return"white"}).attr("opacity",function(t){return t.id!=n?.4:1}).attr("r",x.bandwidth()/2.4).attr("stroke-width",1),d3.select("circle.unid-"+e).attr("stroke-width",3).attr("r",x.bandwidth()/1.5)}).on("mouseover",function(t,e){var n=t.data,r=document.querySelector("circle.unid-"+e).getBoundingClientRect(),a=r.right>c.left+c.width/2?r.right-370:r.right+20,o=d3.select(".tooltip").style("left",a+"px"),i=void 0,s="<span class='tooltip-title'>"+n.title+"</span><br><span class='tooltip-content'><em>"+n.season+" season</em></span><br><span class='tooltip-content'>Appeared in "+n.seasonCount+" "+(1==n.seasonCount?"season":"seasons")+"</span><br><span class='tooltip-content'>"+(n.numOfPerfs/d.length*100).toFixed(2)+"% of all performances of works by "+n.composer+"</span>";o.html(s),i=document.querySelector(".tooltip").getBoundingClientRect().height,o.style("top",r.top-Math.floor(i/1.5)+"px"),o.transition().duration(500).style("opacity",.9),d3.select("circle.unid-"+e).attr("stroke-width",3).attr("r",x.bandwidth()/1.5)}).on("mouseout",function(t,e){d3.select(".tooltip").transition().duration(300).style("opacity",0),d3.select("circle.unid-"+e).attr("stroke-width",1).attr("r",x.bandwidth()/2.4)}).style("pointer-events","all").style("fill","none")}var p=$(".main-container").innerWidth(),v=.75*$(window).innerHeight(),x=d3.scaleBand().domain(s).range([.05*p,.95*p]),g=d3.scaleLinear().domain([0,31]).range([.92*v,0]),y=d3.voronoi().x(function(t){return x(t.season)}).y(function(t){return g(t.seasonWorkCount)}),k=void 0,b=d3.axisBottom(x).tickValues(x.domain().filter(function(t,e){return window.innerWidth>=1100?["1842-43","1850-51","1875-76","1900-01","1925-26","1950-51","1975-76","2000-01","2016-17"].includes(t):["1850-51","1900-01","1950-51","2000-01"].includes(t)})).tickSize(.92*v),w=d3.axisLeft(g).ticks(5).tickSize(.009*p),I=void 0,C=void 0,A=void 0,S=void 0,W=void 0,E=void 0,B={top:7,left:20,bottom:20,right:8},O=95-B.bottom-B.top,M=void 0,L=void 0,q=d3.scaleLinear().domain([0,31]).range([O,0]),j=void 0,N=d3.axisLeft(q).tickValues([0,30]).tickSize(0),P=void 0;d3.scaleLinear().domain([0,20]).range([0,.8*p])(1);$(".select-value").on("change",function(t){h(this.value)}),t.forEach(function(t,e){var n="<option value='"+e+"'>"+r(t.composer)+"</option>";$(".select-value").append(n)}),$(".dot-chart-prelude").on("click",function(t){"dots"===l?function(t){var e=t.target.dataset.index,n=document.querySelector(".dot-chart .graphic-title"),r=navigator.userAgent.match(/Chrome\/\d*|Firefox\/\d*/),a=r[0].match(/Chrome|Firefox/)[0],o=r[0].match(/\d+/)[0],i="Firefox"==a&&o>=36||"Chrome"==a&&o>=61?{block:"start",behavior:"smooth"}:null;t.target.dataset.index&&(i?n.scrollIntoView(i):n.scrollIntoView(),f(e))}(t):function(t){var e=t.target.dataset.index;document.querySelector("#composer"+e).scrollIntoView()}(t)}),$("#dot-chart").on("click",function(t){var e=$(".select-value").val()||0;"path"!==t.target.tagName&&!o().any()&&window.matchMedia("(min-width: 900px)").matches&&m(e)}),window.addEventListener("resize",i(function(){var t=void 0;t=!o().any()&&window.matchMedia("(min-width: 900px)").matches?"dots":"mobile",console.log(l,t),l===t?"dots"===l?a():u():("dots"===l?(l=t,document.querySelector(".composer-charts")||(l=t,n()),d3.select(".dot-chart-heading-middle").classed("hidden",!0),d3.select(".composers-chart-container").classed("hidden",!0),d3.select(".composer-charts").classed("hidden",!1),u()):(document.querySelector(".composers-chart-container")||(l=t,e(),f(0)),d3.select(".composers-chart-container").classed("hidden",!1),d3.select(".dot-chart-heading-middle").classed("hidden",!1),d3.select(".composer-charts").classed("hidden",!0),a()),l=t)},200)),$(".select-value").select2({matcher:function(t,e){var n=[{name:"antonin dvorak",id:14},{name:"camille saint-saens",id:22},{name:"bela bartok",id:23},{name:"cesar franck",id:33},{name:"frederic chopin",id:34},{name:"peter ilich tchaikovsky",id:3},{name:"sergey rachmaninov",id:21},{name:"modest mussorgsky",id:35},{name:"sergey prokofieff",id:18}];if(""===$.trim(t.term))return e;for(var r=0;r<n.length;r++)if(n[r].name.match(t.term.toLowerCase().trim())&&e.id==n[r].id)return e;return e.text.toLowerCase().indexOf(t.term.toLowerCase().trim())>-1?e:null}}),!o().any()&&window.matchMedia("(min-width: 900px)").matches?(l="dots",e(),f(0)):(l="mobile",d3.select(".dot-chart-heading-middle").classed("hidden",!0),n(),console.log(function(){var t=Math.floor(78*Math.random())+1842,e=t+62,n=[];return s.forEach(function(e,r){var a=parseInt(e)>t+20?Math.floor(7*Math.random()):0,o={season:e,count:parseInt(e)-t==100?14:a};n.push(o)}),{composer:"Composer X",birth:t,death:e,seasons:n}}()))})},{"../../temp_utils/generate_seasons.js":3,"../../temp_utils/is-mobile.js":4,"just-debounce-it":2}],2:[function(t,e,n){e.exports=function(t,e,n){var r;return function(){if(!e)return t.apply(this,arguments);var a=this,o=arguments,i=n&&!r;return clearTimeout(r),r=setTimeout(function(){r=null,i||t.apply(a,o)},e),i?t.apply(this,arguments):void 0}}},{}],3:[function(t,e,n){e.exports=function(t,e){for(var n=[],r=t;r<=e;r++){var a=String(r+1).slice(2,4);n.push(String(r+"-"+a))}return n}},{}],4:[function(t,e,n){function r(){return{android:function(){return navigator.userAgent.match(/Android/i)},blackberry:function(){return navigator.userAgent.match(/BlackBerry/i)},ios:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i)},opera:function(){return navigator.userAgent.match(/Opera Mini/i)},windows:function(){return navigator.userAgent.match(/IEMobile/i)},any:function(){return r().android()||r().blackberry()||r().ios()||r().opera()||r().windows()}}}e.exports=r},{}]},{},[1]);