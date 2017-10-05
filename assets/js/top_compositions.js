let top15 = rankings.map((bucket,idx) => {
		let fifteenth = bucket[14];
		
		let count = fifteenth[1].count; 
		
		let lastIndex = 0; 

		let currentCount = bucket[lastIndex][1].count; 
		
		while (currentCount >= count) {
			++lastIndex; 
			currentCount = bucket[lastIndex][1].count; 

		}
		console.log(lastIndex); 	
		return bucket.slice(0,lastIndex).map(arr => {
			return [arr[0], arr[1].title, arr[1].composer, arr[1].count, arr[2]]; 
		}).filter(arr => arr[2] !== "Anthem,"); 
	}); 
	
	console.log(top15);
	
	top15[2].forEach( (piece) => {
		let composer = piece[2], 
				composerImage = composer.toLowerCase().split(" ")[0].match(/[a-z]*/)[0] + '.png', 
				title = piece[1], 
				count = piece[3], 
				rank = piece[4]; 
		
		let imageCell = `<td><img src='assets/images/composer_sqs/${composerImage}'/></td>`, 
				freqCell = `<td>${count}</td>`, 
				titleCell = `<td class="titles">${title}</td>`, 
				composerCell = `<td><img src='assets/images/composer_sqs/${composerImage}'/>${composer}</td>`, 
				rankCell = `<td>${rank}</td>`, 
				row = `<tr>${imageCell}${rankCell}${titleCell}${composerCell}${freqCell}</tr>`; 
		
		//console.log(row); 
		
		$('.comp-rankings').append(`<tr>${rankCell}${titleCell}${composerCell}${freqCell}</tr>`); 
		
	}); 
	let top15Composers = []; 
	top15.forEach(bucket => {
		bucket.forEach(comp => {
			if (!top15Composers.includes(comp[2])) top15Composers.push(comp[2]); 
		})
	}); 
	
	console.log(top15Composers); 
	