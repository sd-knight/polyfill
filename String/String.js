if(!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g,'');
  };
}

if ( !String.prototype.startsWidth ) {
	String.prototype.startsWidth = function ( str, position ) {
		if ( this == null ) throw new TypeError('can\'t convert' + this + 'to object');
		var string = String(this),
			str = String(str),
			l = string.length,
			pos = position ? Number(position) : 0;

		if ( pos != pos ) pos = 0;
		var start = Math.min(Math.max(pos,0), l);
		if ( start + str.length > l ) return false;
		return string.substr(start, str.length) == str;
	}
}

if ( !String.prototype.endsWidth ) {
	String.prototype.endsWidth = function ( str, position ) {
		if ( this == null ) throw new TypeError('can\'t convert' + this + 'to object');
		var string = String(this),
			str = String(str),
			l = string.length,
			pos = position ? Number(position) : l;

		if ( pos != pos ) pos = l;
		var end = Math.min(Math.max(pos,0), l);
		if ( end - str.length < 0 ) return false;
		return string.substring(end-str.length, end) == str;
	}
}

if ( !String.prototype.repeat ) {
	String.prototype.repeat = function ( count ) {
		if ( this == null ) throw new TypeError('can\'t convert' + this + 'to object');
		var string = String(this),
			str = '',
			count = Number(count);
		if ( count != count ) count = 1;
		if ( count < 0 ) throw RangeError('repeat count must be non-negative')
		if (count == Infinity) throw new RangeError('repeat count must be less than infinity');
		count = Math.floor(count);
		if ( string.length === 0 || count ===0 ) return '';
		if (string.length * count >= 1 << 28) {
	      throw new RangeError('repeat count must not overflow maximum string size');
	    }
		while (true) {
			if ( (count & 1) == 1 ) {
		        str += string;
		      }
		      count >>>= 1;
		      if ( count == 0 ) {
		        break;
		      }
		      string += string;
		}
		return str;
	}
}