typeof Promise !== 'undefined' || void function (local){

	var isBrowser = typeof window !== 'undefined' && typeof local.document !== 'undefined';
	var isWorker = typeof self !== 'undefined' && typeof importScripts !== 'undefined';
	var isNode = typeof global !== 'undefined';

	//Promise 3 种状态
	var PENDING = 0,
		FULFILLED = 1,
		REJECTED = 2;

	//空函数
	function noop (resolve, reject){}

	//nextTick实现
	var nextTick = (function(){
		if (isNode) {
			return process.nextTick;
		} else if (isBrowser && window.MutationObserver){
			var node = document.createTextNode(''), queue = [], i = 0;
			new MutationObserver(function (){
				if (queue.length === 0) return;
				queue.forEach(function (fn){
					fn();
				});
				queue = [];
			}).observe(node, {characterData: true});

			return function (fn){
				if (typeof fn !== 'function') throw new TypeError(fn + 'is not a function');
				queue.push(fn);
				node.data = (i = ++i%2);
			}
		
		} else {
			return function (fn){
				setTimeout(fn);
			}
		}
	})();

	//判断对象是否thenable
	function isThenable (obj){
		return typeof obj === 'object' && obj !== null && typeof obj.then === 'function';
	}

	function resolvePromise(promise, val){
		if (promise._state !== PENDING) return;
		if (promise === val) rejectPromise(promise, new TypeError('Chaining cycle detected for promise'));

		if (Promise.isPromise(val)){
			switch (val._state) {
				case PENDING:
					val.then(function (val){
						resolvePromise(promise, val);
					}, function (reason){
						rejectPromise(promise, reason);
					});
				break;
				case FULFILLED:
					resolvePromise(promise, val._result);
				break;
				case REJECTED:
					rejectPromise(promise, val._result);
			}

		} else if (isThenable(val)){
			try {
				var then = val.then;
				if (typeof then === 'function'){
					then.call(val, function (val){
						resolvePromise(promise, val);
					}, function (reason){
						rejectPromise(promise, reason);
					});
				}
			} catch (e){
				rejectPromise(e);
			}
		} else {
			promise._state = FULFILLED;
			promise._result = val;
			if (promise._fulfill.length !==0) {
				for (var i = 0; i < promise._fulfill.length; i++) {
					promise._fulfill[i](promise._result);
				};
			}
		}
	}

	function rejectPromise (promise, reason){
		if (promise._state !== PENDING) return;
		promise._state = REJECTED;
		promise._result = reason;
		if (promise._reject.length !== 0) {
			for (var i = 0; i < promise._reject.length; i++) {
				promise._reject[i](promise._result);
			};
		}
	}

	//Promise构建函数
	var Promise = function (resolver){
		if (!this instanceof Promise) throw Error('undefined is not a promise');
		if (typeof resolver !== 'function') throw TypeError('Promise resolver is not a function');
		this._state = PENDING;
		this._fulfill = [];
		this._reject = [];
		this._result = void 0;

		var that = this;

		function resolve (val){
			resolvePromise(that, val);
		}
		function reject (reason){
			rejectPromise(that, reason);
		}
		try {
			resolver(resolve, reject);
		} catch (e){
			rejectPromise(that, e);
		}
	}

	Promise.prototype.then = function (onFulfill, onReject){
		var promise = new Promise(noop);
		var that = this;
		if (typeof onFulfill === 'function'){
			if (this._state === FULFILLED){
				nextTick(function(){
					var res = onFulfill(that._result);
					if (res instanceof Promise){
						res.then(function (val){
							resolvePromise(promise, val);
						}, function (reason){
							rejectPromise(promise, reason);
						});
					} else {
						resolvePromise(promise, res);
					}
				});
			} else if (this._state === PENDING) {
				this._fulfill.push(function(val){
					var res = onFulfill(val);
					if (res instanceof Promise){
						res.then(function(val){
							resolvePromise(promise, val);
						}, function (reason){
							rejectPromise(promise, reason);
						});
					} else {
						resolvePromise(promise, res);
					}
				});
			}
		} else {
			if (this._state === FULFILLED){
				resolvePromise(promise, this._result);
			} else if (this._state === PENDING) {
				this._fulfill.push(function (val){
					resolvePromise(promise, val);
				});
			}
		}

		if (typeof onReject === 'function'){
			if (this._state === REJECTED){
				nextTick(function(){
					var res = onReject(that._result);
					if (res instanceof Promise){
						res.then(function (val){
							resolvePromise(promise, val);
						}, function (reason){
							rejectPromise(promise, reason);
						});
					} else {
						resolvePromise(promise, res);
					}
				});
			} else if (this._state === PENDING) {
				this._reject.push(function (reason){
					var res = onReject(reason);
					if (res instanceof Promise){
						res.then(function (val){
							resolvePromise(promise, val);
						}, function (reason){
							rejectPromise(promise, reason);
						});
					} else {
						resolvePromise(promise, res);
					}
				});
			}
		} else {
			if (this._state === REJECTED){
				rejectPromise(promise, this._result);
			} else if (this._state === PENDING) {
				this._reject.push(function (reason){
					resolvePromise(promise, reason);
				});
			}
		}
		return promise;
	}

	Promise.prototype.catch = function (onReject){
		return this.then(undefined, onReject);
	}

	Promise.resolve = function (obj){
		if (obj instanceof Promise && obj.constructor === Promise){
			return obj;
		}

		var promise = new Promise(noop);

		if (isThenable(obj)) {
			obj.then(function (val){
				resolvePromise(promise, val);
			}, function (reason){
				rejectPromise(promise, reason);
			});
		} else {
			resolvePromise(promise, obj);
		}
		return promise;
	}

	Promise.reject = function (x){
		var promise = new Promise(noop);
		rejectPromise(promise, x);
		return promise;
	}

	Promise.all = function (arr){
		if (Object.prototype.toString.call(arr) !== '[object Array]'){
			throw TypeError('invalid_argument');
		}
		var promise = new Promise(noop);
		var result = [], i = 0, l = arr.length, count = 0;

		for (i = 0; i < l; i++) {
			result.push(void 0);
			if (!Promise.isPromise(arr[i])) arr[i] = Promise.resolve(arr[i]);
			(function (num){
				arr[num].then(function (val){
					result[num] = val;
					if (++count === l){
						resolvePromise(promise, result);
					}
				}, function (reason){
					rejectPromise(promise, reason);
				});
			})(i);
		};
		return promise;
	}

	Promise.race = function (arr){
		if (Object.prototype.toString.call(arr) !== '[object Array]'){
			throw TypeError('invalid_argument');
		}
		var promise = new Promise(noop);
		var i = 0, l = arr.length;

		for (var i = 0; i < l; i++) {
			if (!Promise.isPromise(arr[i])) arr[i] = Promise.resolve(arr[i]);
			arr[i].then(function (val){
				resolvePromise(promise, val);
			}, function (reason){
				rejectPromise(promise, reason);
			});
		};
		return promise;
	}

	Promise.isPromise = function (obj){
		return obj instanceof Promise && obj.constructor === Promise;
	}

	if (isNode) {
		module.exports = Promise;
	} else if (isBrowser) {
		window.Promise = Promise;
	} else if (isWorker) {
		self.Promise = Promise;
	}
}(this)