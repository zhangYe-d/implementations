import React from '../../../src/react/react.js'
import ReactDom from '../../../src/react-dom/ReactDom.js'

const App = props => {
	const { name, age } = props
	const [count, setCount] = ReactDom.useState(0)
	return React.createElement(
		'div',
		{ id: 'foo' },
		React.createElement(
			'p',
			{
				onClick: () => {
					setCount(count + 1)
					console.log('hhah')
				},
				id: 'fooo',
			},
			name
		),
		React.createElement('a', null, age),
		React.createElement('h1', null, count)
	)
}

const container = document.getElementById('root')

ReactDom.render(React.createElement(App, { name: 'foo', age: 20 }), container)
