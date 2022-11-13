import React from 'react'
import { useRoutes } from './hooks'

export function Routes(props) {
	const routes = createRoutesFromChildren(props.children)

	return useRoutes(routes)
}

function createRoutesFromChildren(children) {
	let routes = []
	React.Children.forEach(children, child => {
		let route = {
			path: child.props.path,
			element: child.props.element,
			children: createRoutesFromChildren(child.props.children),
		}

		routes.push(route)
	})

	return routes
}
