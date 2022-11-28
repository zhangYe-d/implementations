import compose from './compose'

function applyMiddleware(...middlewares) {
	return createStore => reducer => {
		const store = createStore(reducer)

		let dispatch = () => {}
		const middlewareApi = {
			getState: store.getState,
			dispatch: (action, ...arg) => dispatch(action, ...arg),
		}

		const chains = middlewares.map(middleware => middleware(middlewareApi))
		dispatch = compose(...chains)(store.dispatch)

		return {
			...store,
			dispatch,
		}
	}
}

export default applyMiddleware
