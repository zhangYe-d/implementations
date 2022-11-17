const Fullfilled = 'fullfilled'
const Pendding = 'pendding'
const Rejected = 'rejected'

class Promise {
	constructor(callback) {
		this.__state__ = Pendding
		this.__value__ = undefined
		this.__reason__ = undefined
		this.callbacks = []

		try {
			callback(this.__resolve__.bind(this))
		} catch (reason) {
			this.__reject__.call(this, reason)
		}
	}

	// get finished() {
	// 	return this.__state__ !== Pendding
	// }

	static resolve(value) {
		return new Promise(resolve => resolve(value))
	}

	static reject(reason) {
		return new Promise((s, reject) => reject(reason))
	}

	static race(promises) {
		return new Promise((resolve, reject) => {
			promises.forEach(promise => promise.then(resolve, reject))
		})
	}

	static any(promises) {
		return new Promise((resolve, reject) => {
			promises.forEach(promise => promise.then(resolve))
		})
	}

	__resolve__(value) {
		if (this.__state__ === Pendding) {
			this.__state__ = Fullfilled
			this.__value__ = value

			this.callbacks.forEach(callback => callback.onFullfilled(this.__result__))
		}
	}

	__reject__(reason) {
		if (this.__state__ === Pendding) {
			this.__state__ = Rejected
			this.__reason__ = reason

			this.callbacks.forEach(callback => callback.onRejected(this.__reason__))
		}
	}

	resolvePromise(promise, resolve, reject, value) {
		if (promise === value) {
			throw new TypeError('类型错误！')
		}

		if (isObject(value) || isFunction(value)) {
			let then = value.then

			if (isFunction(then)) {
				try {
					then.call(
						value,
						this.resolvePromise.bind(null, promise, resolve, reject),
						this.rejectPromise.bind(null, promise, resolve, reject)
					)
				} catch (reason) {
					reject(reason)
				}
			} else {
				resolve(value)
			}
		} else {
			resolve(value)
		}
	}

	rejectPromise(promise, resolve, reject, reason) {
		reject(reason)
	}

	then(onFullfilled, onRejected) {
		let self = this
		let promise = new Promise((resolve, reject) => {
			function handleFullfill() {
				const value = isFunction(onFullfilled)
					? onFullfilled(self.__value__)
					: self.__value__
				self.resolvePromise(promise, resolve, reject, value)
			}

			function handleReject() {
				let result = isFunction(onRejected)
					? onRejected(self.__reason__)
					: self.__reason__
				if (isFunction(onRejected)) {
					self.resolvePromise(promise, resolve, reject, result)
				} else {
					self.rejectPromise(promise, resolve, reject, result)
				}
			}

			function handlePendding() {
				this.callbacks.push({
					onFullfilled: setTimeout(handleFullfill),
					onRejected: setTimeout(handleReject),
				})
			}

			switch (self.__state__) {
				case Fullfilled: {
					setTimeout(handleFullfill)
					break
				}
				case Rejected: {
					setTimeout(handleReject)
					break
				}
				case Pendding: {
					handlePendding()
					break
				}
				default:
					break
			}
		})

		return promise
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

let p1 = new Promise(resolve => resolve(100))
setTimeout(() => {
	p1.then(res => console.log('res', res))
	console.log('notres', 300)
})

// Promise.resolve(200).then(r => console.log(r))
// console.log(111)

export default Promise
