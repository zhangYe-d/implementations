import React from '../../../src/react/react.js'
import ReactDom from '../../../src/react-dom/ReactDom.js'

const App = props => {
	const { name, age } = props
	const [reverse, setReverse] = ReactDom.useState(false)
	ReactDom.useEffect(() => {
		console.log(reverse)
	})
	return React.createElement(
		'div',
		{ id: 'foo', style: { margin: '0 300px', paddingTop: '200px' } },
		React.createElement(
			'p',
			{
				onClick: () => {
					setReverse(!reverse)
					console.log('hhah')
				},
				id: 'fooo',
			},
			name
		),
		reverse
			? React.createElement('a', { key: 'a' }, age)
			: React.createElement('h1', { key: 'h1' }, age + 100),

		reverse
			? React.createElement('h1', { key: 'h1' }, name)
			: React.createElement('a', { key: 'a' }, name.toUpperCase()),
		React.createElement('i', { key: 'i' }, name),
		...(reverse ? [React.createElement('h1', { key: '1111f' }, name)] : [])
	)
}

const container = document.getElementById('root')

ReactDom.render(React.createElement(App, { name: 'foo', age: 20 }), container)
