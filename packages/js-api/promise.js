const Fullfilled = 'fullfilled'
const Pendding = 'pendding'
const Rejected = 'rejected'

class Promise {
	constructor(callback) {
		this.__state__ = Pendding
		this.__result__ = undefined
		this.finishedCallbacks = []

		callback(this.__resolve__)
	}

	get finished() {
		return this.__state__ !== Pendding
	}

	__resolve__(result) {
		if (this.finished) {
			return
		}

		if (isPromise(result)) {
			switch (result.__state__) {
				case Pendding: {
					result.__resolve__ = res => {
						result.__resolve__.call(result, res)
						this.__resolve__(res)
						return
					}
				}
				case Fullfilled: {
					this.__resolve__(result.__result__)
					return
				}
			}
		}

		if (isFunction(result) || isObject(result)) {
			let then = result.then

			if (isFunction(then)) {
				function resolvePromise(res) {
					this.__resolve__(res)
				}

				then(resolvePromise)
			} else {
				handleFullfill(result)
			}
		} else {
			handleFullfill(result)
		}

		let promiseInstance = this

		function handleFullfill(result) {
			promiseInstance.__state__ = Fullfilled
			promiseInstance.__result__ = result
			setTimeout(() => {
				let callback
				while ((callback = this.finishedCallbacks.shift())) {
					if (isFunction(callback.onFullfilled)) {
						const res = callback.onFullfilled(this.__result__)
						callback.promise.__resolve__(res)
					} else {
						callback.promise.__resolve__(result)
					}
				}
			})
		}

		// setTimeout(handleFullfill)
	}

	then(onFullfilled, onRejected) {
		// if (typeof onFullfilled === 'function') {
		//   this.fullfilledCallbacks.push(onFullfilled)
		// } else {
		//   switch (this.__state__) {
		//     case Fullfilled: {
		//       return new Promise((resolve, reject) => resolve(this.__result__))
		//     }
		//     default: break

		//   }
		let callback = {
			onFullfilled,
			onRejected,
			promise: new Promise(function () {}),
		}

		this.finishedCallbacks.push(callback)

		return callback.promise
	}
}

function isObject(target) {
	return Object.prototype.toString.call(target) === '[object Object]'
}

function isFunction(target) {
	return typeof target === 'function'
}

function isPromise(target) {
	return target instanceof Promise
}

export default Promise
