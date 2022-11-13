import { useContext, createContext, useRef, useState, useEffect } from 'react'
import { BrowserRouter as Router } from './router'
import { Routes } from './routes'
import { Route } from './route'
import { Outlet } from './outlet'
import { useNavigator } from './hooks'

function App() {
	return (
		<div className='App'>
			<Router>
				<Button />
				<Routes>
					<Route path='/' element={<Home />}>
						<Route path='product' element={<Product />} />
					</Route>
				</Routes>
			</Router>
		</div>
	)
}

function Button() {
	const navigator = useNavigator()
	return <button onClick={() => navigator('product')}>点我切换页面</button>
}

function Product() {
	return <div>Product</div>
}

function Home() {
	return (
		<div>
			<div>Home</div>
			<Outlet />
		</div>
	)
}

export default App
