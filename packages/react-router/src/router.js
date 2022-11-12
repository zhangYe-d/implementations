import { useState, useRef, useEffect } from 'react'
import { createBrowserHistory } from 'history'
import { RouterContext } from './context'

export function BrowserRouter(props) {
	const historyRef = useRef()

	if (!historyRef.current) {
		historyRef.current = createBrowserHistory()
	}

	const [state, setState] = useState({ location: window.location })

	useEffect(() => {
		const unlisten = historyRef.current.listen(setState)

		return unlisten
	}, [setState])

	return (
		<RouterContext.Provider
			value={{ location: state.location, navigator: historyRef.current }}
		>
			{props.children}
		</RouterContext.Provider>
	)
}
