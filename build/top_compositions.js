"use strict";

var top15 = rankings.map(function (bucket, idx) {
	var fifteenth = bucket[14];

	var count = fifteenth[1].count;

	var lastIndex = 0;

	var currentCount = bucket[lastIndex][1].count;

	while (currentCount >= count) {
		++lastIndex;
		currentCount = bucket[lastIndex][1].count;
	}
	console.log(lastIndex);
	return bucket.slice(0, lastIndex).map(function (arr) {
		return [arr[0], arr[1].title, arr[1].composer, arr[1].count, arr[2]];
	}).filter(function (arr) {
		return arr[2] !== "Anthem,";
	});
});

console.log(top15);

top15[2].forEach(function (piece) {
	var composer = piece[2],
	    composerImage = composer.toLowerCase().split(" ")[0].match(/[a-z]*/)[0] + '.png',
	    title = piece[1],
	    count = piece[3],
	    rank = piece[4];

	var imageCell = "<td><img src='assets/images/composer_sqs/" + composerImage + "'/></td>",
	    freqCell = "<td>" + count + "</td>",
	    titleCell = "<td class=\"titles\">" + title + "</td>",
	    composerCell = "<td><img src='assets/images/composer_sqs/" + composerImage + "'/>" + composer + "</td>",
	    rankCell = "<td>" + rank + "</td>",
	    row = "<tr>" + imageCell + rankCell + titleCell + composerCell + freqCell + "</tr>";

	//console.log(row); 

	$('.comp-rankings').append("<tr>" + rankCell + titleCell + composerCell + freqCell + "</tr>");
});
var top15Composers = [];
top15.forEach(function (bucket) {
	bucket.forEach(function (comp) {
		if (!top15Composers.includes(comp[2])) top15Composers.push(comp[2]);
	});
});

console.log(top15Composers);