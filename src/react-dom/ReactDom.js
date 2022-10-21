const render = (element, container) => {
	const HtmlElement =
		element.type === 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(element.type)

	const isProperty = propName => propName !== 'children'

	Object.keys(element.props)
		.filter(isProperty)
		.forEach(propName => {
			HtmlElement[propName] = element.props[propName]
		})

	element.props.children.forEach(child => {
		render(child, HtmlElement)
	})

	container.appendChild(HtmlElement)
}

export default { render }
