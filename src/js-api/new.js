function newFun(fn, ...arg) {
	let instance = {}
	instance.__proto__ = fn.prototype

	let res = fn.apply(instance, arg)

	return typeof res === 'object' && res !== null ? res : instance
}

export default newFun
