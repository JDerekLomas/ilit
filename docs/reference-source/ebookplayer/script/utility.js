//FUNCTION TO PRINT ALL THE KEY AND VALUE PAIR OF JSON
function printJSON(objJson){
	$.each(objJson, function(key, value){
		console.log(key);
		$.each(value, function(key, value){
			console.log(key, value);
		});
	});
}