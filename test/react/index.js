import React from '../../src/react/react.js'
import ReactDom from '../../src/react-dom/ReactDom.js'

const element = React.createElement(
	'div',
	{ id: 'foo' },
	React.createElement('p', null, '哈哈哈'),
	React.createElement('a', null, '呵呵')
)

const container = document.getElementById('root')

ReactDom.render(element, container)
