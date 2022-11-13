import { useState, useRef, useEffect } from 'react'
import { createBrowserHistory } from 'history'
import { NavigatorContext } from './context'

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
		<NavigatorContext.Provider
			value={{ location: state.location, navigator: historyRef.current }}
		>
			{props.children}
		</NavigatorContext.Provider>
	)
}
