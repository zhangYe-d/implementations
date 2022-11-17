function newFun(fn, ...arg) {
	let instance = {}
	instance.__proto__ = fn.prototype

	let res = fn.apply(instance, arg)

	return typeof res === 'object' && res !== null ? res : instance
}

let p1 = new Promise(resolve => resolve(100))
setTimeout(() => {
	p1.then(res => console.log('res', res))
	console.log('notres', 300)
})

export default newFun
