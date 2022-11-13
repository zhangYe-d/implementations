import { useContext } from 'react'
import { NavigatorContext, RouteContext } from './context'

export function useRoutes(routes) {
	const location = useLocation()

	const matches = matchRoutes(routes, location)

	return renderMatches(matches)
}

export function useNavigator() {
	const { navigator } = useContext(NavigatorContext)

	return navigator.push
}

export function useLocation() {
	const { location } = useContext(NavigatorContext)

	return location
}

export function useOutlet() {
	const { outlet } = useContext(RouteContext)
	return outlet
}

function flattenRoutes(routes, branches = [], parentPath = '') {
	routes.forEach(route => {
		let branch = {
			route,
			path:
				route.path.includes('/') || parentPath === '/'
					? parentPath + route.path
					: parentPath + '/' + route.path,
		}

		branches.push(branch)
		flattenRoutes(route.children, branches, branch.path)
	})

	return branches
}

function matchRoutes(routes, location) {
	const branches = flattenRoutes(routes)

	console.log(branches)

	return branches.filter(branch => location.pathname.startsWith(branch.path))
}

function renderMatches(matches) {
	if (!matches) {
		return null
	}

	return matches.reduceRight((outlet, match) => {
		return (
			<RouteContext.Provider value={{ outlet }}>
				{match.route.element}
			</RouteContext.Provider>
		)
	}, null)
}
