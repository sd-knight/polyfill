function shuffle (array) {
	if ( !Array.isArray(array) ) throw TypeError('The argument must be array');
	var l = array.length;
	if ( l <= 1 ) return array;
	var x, ran;
	while (l > 0) {
		ran = Math.floor(Math.random()*l)
		x = array[ran];
		array[ran] = array[--l];
		array[l] = x;
	};
	return array;
}

function flatten (array) {
	if ( !Array.isArray(array) ) throw TypeError('The argument must be array');
	var res = [];
	for (var i = 0; i < array.length; i++) {
		if ( Array.isArray(array[i]) ) {
			res = res.concat(flatten(array[i]));
		} else {
			res.push(array[i]);
		}
	};
	return res;
}

function unique (array) {
	if ( !Array.isArray(array) ) throw TypeError('The argument must be array');
	var res = [];
	if ( Set ) {
		new Set(array).forEach(function (v){
			res.push(v);
		});
		return res;
	}
	loop: for (var i = 0, l = array.length; i < l; i++) {
		for (var j = i+1; j < l; j++) {
			if ( array[i] === array[j] ) {
				continue loop;
			}
		};
		res.push(array[i]);
	};
	return res;
}