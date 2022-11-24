function combineReducers(reducersObject) {
	return (state, action) => {
		let nextState = {}
		for (let key in reducersObject) {
			if (Object.hasOwn(key)) {
				nextState[key] = reducersObject[key](state[key], action)
			}
		}

		return nextState
	}
}

export default combineReducers
