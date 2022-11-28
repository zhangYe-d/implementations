function createEvent() {
	let handlers = []

	return {
		get length() {
			return handlers.length
		},

		listen(callback) {
			handlers.push(callback)
			return () => {
				handlers = handlers.filter(handler => handler !== callback)
			}
		},
	}
}

function createStore(initialReducer) {
	let state = null
	let reducer = initialReducer

	const event = createEvent()

	function dispatch(action) {
		state = reducer(state, action)
		return dispatch
	}

	return {
		dispatch,
		getState: () => state,
		subscribe: event.listen,
		replaceReducer: newReducer => (reducer = newReducer),
	}
}

export default createStore
