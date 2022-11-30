let currentHandler = null

function makeObservable(target) {
	for (const prop in target) {
		let val = target[prop]
		let observerStack = []
		if (target.hasOwnProperty(prop)) {
			Object.defineProperty(target, prop, {
				get() {
					if (!observerStack.includes(currentHandler)) {
						observerStack.push(currentHandler)
					}
					return val
				},

				set(value) {
					val = value
					observerStack.forEach(callback => callback())
				},
			})
		}
	}
}

function autorun(handler) {
	currentHandler = handler
	handler()
	currentHandler = null
}

// test
let a = { foo: 1, bar: 'haha' }
makeObservable(a)

autorun(() => {
	console.log('foo: ', a.foo)
	// console.log('bar: ', a.bar)
})
