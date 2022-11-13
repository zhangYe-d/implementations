import { createContext } from 'react'

// export const RouterContext = createContext({
// 	location: window.location,
// 	navigator: window.history,
// })

export const NavigatorContext = createContext()
export const RouteContext = createContext({ outlet: null })
