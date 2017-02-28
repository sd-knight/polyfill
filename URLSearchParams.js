typeof URLSearchParams == 'undefined' && (function(g){
	function URLSearchParams(init) {
		if (!this instanceof URLSearchParams) {
			return new URLSearchParams(init);
		}
		if (init instanceof URLSearchParams) {
			return init;
		}
		var store = {}, 
				key_value_arr = [], 
				key_value = "",
				key = "",
				value = "",
				init = String(init);
		if (init.charAt(0) == '?') {
			init = init.slice(1);
		}
		key_value_arr = init.split('&');
		for (var i = 0; i < key_value_arr.length; i++) {
			key_value = key_value_arr[i].split("=");
			key = key_value[0];
			value = key_value[1];
			if (store[key]) {
				store[key].push(value);
			} else {
				store[key] = [value];
			}
		}
		this._store = store;
	}

	URLSearchParams.prototype = {
		append: function(key, value) {
			key = String(key);
			value = String(value);
			if (this._store[key]) {
				this._store[key].push(value);
			} else {
				this._store[key] = [value];
			}
		},
		delete: function(key) {
			if (this._store[key]) {
				delete this._store[key];
			}
		},
		entries: function() {
			var store = this._store,
					key_value_arr = [],
					index = 0;
			for (var key in store) {
				for (var i = 0; i < store[key].length; i++) {
					key_value_arr.push([key, store[key][i]]);
				}
			}
			var iterator = {
				next: function() {
					if (index < key_value_arr.length) {
						return {
							value: key_value_arr[index++],
							done: false
						}
					} else {
						return {
							value: void 0,
							done: true
						}
					}
				}
			}
			if (typeof Symbol !== 'undefined' && Symbol.iterator) {
				iterator[Symbol.iterator] = function() {
					return this;
				}
			}
			return iterator;
		},
		get: function(key) {
			if (this._store[key]) {
				return this._store[key][0];
			}
		},
		getAll: function(key) {
			if (this._store[key]) {
				return this._store[key];
			}
		},
		has: function(key) {
			return this._store[key] ? true : false;
		},
		keys: function() {
			var entries = this.entries();
			var iterator = {
				next: function() {
					var key_value = entries.next();
					return {
						value: key_value.done ? void 0 : key_value.value[0],
						done: key_value.done
					}
				}
			};
			if (typeof Symbol !== 'undefined' && Symbol.iterator) {
				iterator[Symbol.iterator] = function() {
					return this;
				}
			}
			return iterator;
		},
		set: function(key, value) {
			key = String(key);
			value = String(value);
			this._store[key] = [value];
		},
		toString: function() {
			var str_arr = [], k, store = this._store;
			for (k in store) {
				for (var i = 0; i < store[k].length; i++) {
					str_arr.push(k + '=' + store[k][i]);
				}
			}
			return str_arr.join('&');
		},
		values: function() {
			var entries = this.entries();
			var iterator = {
				next: function() {
					var key_value = entries.next();
					return {
						value: key_value.done ? void 0 : key_value.value[1],
						done: key_value.done
					}
				}
			};
			if (typeof Symbol !== 'undefined' && Symbol.iterator) {
				iterator[Symbol.iterator] = function() {
					return this;
				}
			}
			return iterator;
		}
	}

	g.URLSearchParams = URLSearchParams;
})(this);