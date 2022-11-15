function bind(fn, bindThis, ...defaultArg) {
	const bindFn = (...arg) => {
		fn.call(bindThis, ...defaultArg, ...arg)
	}

	return bindFn
}

function foo(p1, p2) {
	console.log('this', this)
	console.log('p1', p1)
	console.log('p2', p2)
}

const bar = bind(foo, { cc: 'cc' }, 'age')
bar('name')
