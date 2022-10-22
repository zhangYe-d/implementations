const createDom = fiber => {
	const HtmlElement =
		fiber.type === 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(fiber.type)

	const isProperty = propName => propName !== 'children'

	Object.keys(fiber.props)
		.filter(isProperty)
		.forEach(propName => {
			HtmlElement[propName] = fiber.props[propName]
		})

	return HtmlElement
}

const performUnitOfWork = fiber => {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	if (fiber.parent) {
		fiber.parent.dom.appendChild(fiber.dom)
	}

	const elements = fiber.props.children
	let index = 0
	let prevSibling = null

	while (index < elements.length) {
		const element = elements[index]

		const newFiber = {
			type: element.type,
			props: element.props,
			parent: fiber,
			dom: null,
		}

		if (index === 0) {
			fiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber

		index++
	}

	if (fiber.child) {
		return fiber.child
	}

	let nextFiber = fiber

	while (nextFiber) {
		if (nextFiber.sibling) {
			return nextFiber.sibling
		}

		nextFiber = nextFiber.parent
	}
}

let nextUnitOfWork = null
let workInProgressRoot = null

const commitWork = fiber => {
	if (!fiber) {
		return
	}

	const parentDom = fiber.parent.dom
	parentDom.appendChild(fiber.dom)

	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

const commitRoot = () => {
	commitWork(workInProgressRoot.child)

	workInProgressRoot = null
}

const workLoop = deadline => {
	let shouldYield = false

	while (nextUnitOfWork && !shouldYield) {
		nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
		shouldYield = deadline.timeRemaining() < 1
	}

	if (!nextUnitOfWork && workInProgressRoot) {
		commitRoot()
	}

	requestIdleCallback(workLoop)
}

requestIdleCallback(workLoop)

const render = (element, container) => {
	workInProgressRoot = {
		dom: container,
		props: {
			children: [element],
		},
	}

	nextUnitOfWork = workInProgressRoot

	// element.props.children.forEach(child => {
	// 	render(child, HtmlElement)
	// })

	// container.appendChild(HtmlElement)
}

export default { render }
