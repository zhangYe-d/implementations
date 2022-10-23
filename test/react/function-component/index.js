import React from '../../../src/react/react.js'
import ReactDom from '../../../src/react-dom/ReactDom.js'

const App = props => {
	const { name, age } = props
	return React.createElement(
		'div',
		{ id: 'foo' },
		React.createElement('p', null, name),
		React.createElement('a', null, age)
	)
}

const container = document.getElementById('root')

ReactDom.render(React.createElement(App, { name: 'foo', age: 20 }), container)
