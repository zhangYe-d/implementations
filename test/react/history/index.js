import React from '../../../packages/react/react.js'
import ReactDom from '../../../packages/react-dom/ReactDom.js'
import { createBrowserHistory } from '../../../packages/history/index.js'

let history = createBrowserHistory()

const HistoryTest = () => {
	const [state, setState] = ReactDom.useState({ location: history.location })

	console.log(state.location.pathname)
	ReactDom.useEffect(() => {
		console.log('hah')
		let unlisten = history.listen(setState)
		return unlisten
	})

	return React.createElement(
		'div',
		null,
		React.createElement('h1', null, state.location.pathname),
		React.createElement(
			'button',
			{
				onClick: () => history.push(Math.random().toFixed(8)),
			},
			'点我呀'
		)
	)
}

ReactDom.render(
	React.createElement(HistoryTest, null),
	document.getElementById('root')
)
