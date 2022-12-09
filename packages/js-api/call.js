Function.prototype.call = function (context, ...args) {
	context = context || globalThis
	context.fn = this

	const res = context.fn(...args)
	delete context.fn

	return res
}
