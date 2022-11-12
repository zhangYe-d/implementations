import { createContext } from 'react'

export const RouterContext = createContext({
	location: window.location,
	navigator: window.history,
})
