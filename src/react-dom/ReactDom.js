const isEvent = propName => propName.startsWith('on')
const isProperty = propName => propName !== 'children' && !isEvent(propName)
const isNew = (prevProps, nextProps) => propName =>
	prevProps[propName] !== nextProps[propName]
const isGone = (prevProps, nextProps) => propName => !(propName in nextProps)

const createDom = fiber => {
	const HtmlElement =
		fiber.type === 'TEXT_ELEMENT'
			? document.createTextNode('')
			: document.createElement(fiber.type)

	Object.keys(fiber.props)
		.filter(isProperty)
		.forEach(propName => {
			HtmlElement[propName] = fiber.props[propName]
		})

	return HtmlElement
}

const updateDom = (dom, prevProps, nextProps) => {
	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone)
		.forEach(propName => {
			dom[propName] = ''
		})

	Object.keys(prevProps)
		.filter(isEvent)
		.filter(
			propName =>
				!(propName in nextProps) || isNew(prevProps, nextProps)(propName)
		)
		.forEach(propName => {
			const eventType = propName.toLowerCase.substring(2)
			dom.removeEventListener(eventType, prevProps[propName])
		})

	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew)
		.forEach(propName => {
			dom[propName] = nextProps[propName]
		})

	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew)
		.forEach(propName => {
			const eventType = propName.toLowerCase.substring(2)
			dom.addEventListener(eventType, nextProps[propName])
		})
}

const updateFunctionComponent = fiber => {
	const elements = [fiber.type(fiber.props)]

	reconciliationChildren(fiber, elements)
}

const updateHostComponent = fiber => {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	reconciliationChildren(fiber, fiber.props.children)
}

const reconciliationChildren = (workInProgressFiber, elements) => {
	let oldFiber =
		workInProgressFiber.alternate && workInProgressFiber.alternate.child
	let index = 0
	let prevSibling = null

	while (index < elements.length || oldFiber !== null) {
		const element = elements[index]
		let newFiber = null

		const sameType = element && oldFiber && element.type === oldFiber.type

		if (sameType) {
			newFiber = {
				type: oldFiber.type,
				props: element.props,
				parent: workInProgressFiber,
				dom: oldFiber.dom,
				alternate: oldFiber,
				effectTag: 'UPDATE',
			}
		}

		if (element && !sameType) {
			newFiber = {
				type: element.type,
				props: element.props,
				parent: workInProgressFiber,
				dom: null,
				alternate: null,
				effectTag: 'PLACEMENT',
			}
		}

		if (oldFiber && !sameType) {
			oldFiber.effectTag = 'DELETION'
			deletions.push(oldFiber)
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling
		}

		if (index === 0) {
			workInProgressFiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber

		index++
	}
}

const performUnitOfWork = fiber => {
	if (fiber.type instanceof Function) {
		updateFunctionComponent(fiber)
	} else {
		updateHostComponent(fiber)
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
let currentRoot = null
let deletions = null

const commitDeletion = (parentDom, fiber) => {
	if (fiber.dom) {
		parentDom.removeChild(fiber.dom)
	} else {
		commitDeletion(parentDom, fiber.child)
	}
}

const commitWork = fiber => {
	if (!fiber) {
		return
	}

	let parentDomFiber = fiber.parent
	while (!parentDomFiber.dom) {
		parentDomFiber = parentDomFiber.parent
	}
	const parentDom = parentDomFiber.dom

	if (fiber.effectTag === 'PLACEMENT' && fiber.dom !== null) {
		parentDom.appendChild(fiber.dom)
	} else if (fiber.effectTag === 'UPDATE' && fiber.dom !== null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props)
	} else if (fiber.effectTag === 'DELETION') {
		commitDeletion(parentDom, fiber)
	}

	commitWork(fiber.child)
	commitWork(fiber.sibling)
}

const commitRoot = () => {
	deletions.forEach(commitWork)
	commitWork(workInProgressRoot.child)

	currentRoot = workInProgressRoot
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
		alternate: currentRoot,
	}

	deletions = []

	nextUnitOfWork = workInProgressRoot

	// element.props.children.forEach(child => {
	// 	render(child, HtmlElement)
	// })

	// container.appendChild(HtmlElement)
}

export default { render }
