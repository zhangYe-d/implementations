const createEvent = () => {
	let handles = []

	return {
		get length() {
			return handles.length
		},
		push(fn) {
			handles.push(fn)
			return () => (handles = handles.filter(handle => handle !== fn))
		},
		call(arg) {
			handles.forEach(handle => handle(arg))
		},
	}
}

const createKey = () => {
	return Math.random().toFixed(16).substring(2, 10)
}

const Action = {
	Pop: 'POP',
	Push: 'PUSH',
	Replace: 'Replace',
}

const createBrowserHistory = () => {
	let globalLocation = window.location
	let globalHistory = window.history

	let action = Action.Pop
	let location = getLocation()

	let listeners = createEvent()

	globalHistory.replaceState({ ...globalHistory.state }, '')

	function createHref(to) {
		return typeof to === 'string' ? to : createPath(to)
	}

	function getLocation() {
		const { search, hash, pathname } = globalLocation
		const state = globalHistory.state || {}

		return {
			search,
			hash,
			pathname,
			state: state.usr || null,
			key: state.key || 'default',
		}
	}

	function getNextLocation(to, state) {
		return {
			pathname: globalLocation.pathname,
			search: '',
			hash: '',
			...(typeof to === 'string' ? parsePath(to) : to),
			state,
			key: createKey(),
		}
	}

	function applyTx(nextAction) {
		action = nextAction
		location = getLocation()

		listeners.call({ location, action })
	}

	function push(to, state) {
		let nextAction = Action.Push
		let nextLocation = getNextLocation(to, state)

		let historyState = {
			usr: nextLocation.state,
			key: nextAction.key,
		}
		let href = createHref(to)

		globalHistory.pushState(historyState, '', href)

		applyTx(nextAction)
	}

	function replace(to, state) {
		let nextAction = Action.Replace
		let nextLocation = getNextLocation(to, state)

		let historyState = {
			usr: nextLocation.state,
			key: nextAction.key,
		}
		let href = createHref(to)

		globalHistory.replaceState(historyState, '', href)

		applyTx(nextAction)
	}

	let history = {
		get action() {
			return action
		},
		get location() {
			return location
		},
		go: globalHistory.go,
		push,
		replace,
		listen(fn) {
			return listeners.push(fn)
		},
	}

	return history
}

const createPath = ({ pathname = '/', search = '', hash = '' }) => {
	let path = pathname

	if (search && search !== '?') {
		path += search.includes('?') ? search : '?' + search
	}

	if (hash && hash !== '#') {
		path += hash.includes('#') ? hash : '#' + hash
	}

	return path
}

const parsePath = path => {
	let parsedPath = {}

	if (path.includes('#')) {
		const hashIndex = path.indexOf('#')
		parsedPath.pathname = path.substr(hashIndex)
		path = path.substring(0, hashIndex)
	}

	if (path.includes('?')) {
		const searchIndex = path.indexOf('#')
		parsedPath.search = path.substr(searchIndex)
		path = path.substring(0, searchIndex)
	}

	if (path) {
		parsedPath.pathname = path
	}

	return parsedPath
}

export { createBrowserHistory }
