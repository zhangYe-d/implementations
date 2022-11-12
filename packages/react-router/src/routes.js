import React from 'react'
import { useRoutes } from './hooks'

export function Routes(props) {
	const routes = createRoutesFromChildren(props.children)

	return useRoutes(routes)
}

function createRoutesFromChildren(children) {
	const routes = React.Children.map(children, child => {
		return {
			path: child.props.path,
			element: child.props.element,
			children: createRoutesFromChildren(child.props.children),
		}
	})

	return routes
}
