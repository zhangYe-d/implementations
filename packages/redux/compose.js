function compose(...funcs) {
	if (funcs.length === 1) {
		return funcs[0]
	}

	return funcs.reduce(
		(a, b) =>
			(...arg) =>
				a(b(...arg))
	)
}

export default compose

function foo() {
	console.log(1)
}

function bar() {
	console.log(2)
}

compose(foo, bar)()
