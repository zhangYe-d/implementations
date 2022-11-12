import { useContext, createContext, useRef, useState, useEffect } from 'react'
import { BrowserRouter as Router } from './router'
import { Routes } from './routes'
import { Route } from './route'
import { useNavigator } from './hooks'

function App() {
	const navigator = useNavigator()

	return (
		<div className='App'>
			<button onClick={() => navigator('product')}>点我切换页面</button>
			<Router>
				<Routes>
					<Route path='/' element={<Home />} />
					<Route path='product' element={<Product />} />
				</Routes>
			</Router>
		</div>
	)
}

function Product() {
	return <div>Product</div>
}

function Home() {
	return <div>Home</div>
}

export default App
