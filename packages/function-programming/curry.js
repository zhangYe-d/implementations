function curry(fn) {
	const argLength = fn.length

	function curriedFn(...arg) {
		if (arg.length < argLength) {
			return (...rest) => curriedFn(...arguments, ...rest)
		}

		return fn(...arg)
	}

	return curriedFn
}

// test

function add(a, b, c) {
	return a + b + c
}

const curriedFn = curry(add)

console.log(curriedFn(1)(2)(3))
