import { useContext } from 'react'
import { RouterContext } from './context'

export function useRoutes(routes) {
	const location = useLocation()
	const elements = []

	routes.forEach(route => {
		const match = location.pathname.startsWith(route.path)

		if (match) {
			elements.push(route.element)
		}
	})

	return elements
}

export function useNavigator() {
	const { navigator } = useContext(RouterContext)

	console.log(navigator)

	return navigator.push
}

export function useLocation() {
	const { location } = useContext(RouterContext)

	return location
}
