const PLACEMENT = 'PLACEMENT'
const UPDATE = 'UPDATE'
const DELETION = 'DELETION'

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

	Object.keys(fiber.props)
		.filter(isEvent)
		.forEach(propName => {
			const eventType = propName.toLowerCase().substring(2)
			HtmlElement.addEventListener(eventType, fiber.props[propName])
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
			const eventType = propName.toLowerCase().substring(2)
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
			const eventType = propName.toLowerCase().substring(2)
			dom.addEventListener(eventType, nextProps[propName])
		})
}

const useState = initial => {
	const oldHook = workInProgressFiber.alternate?.hooks?.[hookIndex]
	const hook = {
		state: oldHook ? oldHook.state : initial,
		queue: [],
	}

	hookIndex++

	const actions = oldHook?.queue || []
	actions.forEach(action => {
		if (typeof action === 'function') {
			hook.state = action(hook.state)
		} else {
			hook.state = action
		}
	})

	const setState = action => {
		hook.queue.push(action)

		workInProgressRoot = {
			dom: currentRoot.dom,
			props: currentRoot.props,
			alternate: currentRoot,
		}
		nextUnitOfWork = workInProgressRoot
		deletions = []
	}

	workInProgressFiber.hooks.push(hook)

	return [hook.state, setState]
}

const updateFunctionComponent = fiber => {
	workInProgressFiber = fiber
	workInProgressFiber.hooks = []
	hookIndex = 0

	const elements = [fiber.type(fiber.props)]

	reconciliationChildren(fiber, elements)
}

const updateHostComponent = fiber => {
	if (!fiber.dom) {
		fiber.dom = createDom(fiber)
	}

	reconciliationChildren(fiber, fiber.props.children)
}

const getHostSibling = fiber => {
	let siblingNode = fiber.sibling
	if (siblingNode) {
		if (siblingNode.alternate === null) {
			return null
		}

		while (!siblingNode.dom) {
			siblingNode = siblingNode.child
		}

		return siblingNode.dom
	}
	return null
}

const insertOrAppendPlacementNode = (parentDom, dom, sibling) => {
	if (sibling) {
		parentDom.insertBefore(dom, sibling)
	} else {
		parentDom.appendChild(dom)
	}
}

const createChild = (parentFiber, element) => {
	return {
		type: element.type,
		key: element.key,
		props: element.props,
		parent: parentFiber,
		dom: null,
		alternate: null,
		effectTag: PLACEMENT,
	}
}

const updateElement = (parentFiber, oldFiber, element) => {
	return {
		type: oldFiber.type,
		props: element.props,
		key: oldFiber.key,
		parent: parentFiber,
		dom: oldFiber.dom,
		alternate: oldFiber,
		effectTag: UPDATE,
	}
}

const updateSlot = (parentFiber, oldFiber, element) => {
	if (oldFiber.key === element.key) {
		return oldFiber.type === element.type
			? updateElement(parentFiber, oldFiber, element)
			: createChild(parentFiber, element)
	}

	return null
}

const updateFromMap = (map, parentFiber, newIndex, element) => {
	const matchedFiber = map.get(element.key || newIndex) || null
	if (matchedFiber) {
		return updateSlot(parentFiber, matchedFiber, element)
	}

	return createChild(parentFiber, element)
}

const placeChild = (newFiber, lastPlacedIndex, newIndex) => {
	newFiber.index = newIndex

	const current = newFiber.alternate
	if (current) {
		const oldIndex = current.index

		if (oldIndex < lastPlacedIndex) {
			newFiber.effectTag = PLACEMENT
			return lastPlacedIndex
		} else {
			return oldIndex
		}
	} else {
		return lastPlacedIndex
	}
}

const deleteChild = fiber => {
	fiber.effectTag = DELETION
	deletions.push(fiber)
}

const deleteRemainingChildren = currentFirstChild => {
	let childToDelete = currentFirstChild
	while (childToDelete != null) {
		deleteChild(childToDelete)
		childToDelete = childToDelete.sibling
	}
}

const mapRemainingChilden = currentFirstChild => {
	const map = new Map()
	let childToMap = currentFirstChild
	while (childToMap) {
		let key = childToMap.key || childToMap.index
		map.set(key, childToMap)

		childToMap = childToMap.sibling
	}

	return map
}

const reconciliationChildren = (workInProgressFiber, elements) => {
	let oldFiber =
		workInProgressFiber.alternate && workInProgressFiber.alternate.child
	let lastPlacedIndex = 0
	let newIndex = 0
	let prevSibling = null

	while (newIndex < elements.length && oldFiber != null) {
		const element = elements[newIndex]
		const newFiber = updateSlot(workInProgressFiber, oldFiber, element)

		if (newFiber === null) {
			break
		}

		if (newFiber && newFiber.alternate === null) {
			deleteChild(oldFiber)
		}

		if (oldFiber) {
			oldFiber = oldFiber.sibling
		}

		lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)

		if (newIndex === 0) {
			workInProgressFiber.child = newFiber
		} else if (element) {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber
		newIndex++
	}

	if (newIndex === elements.length) {
		if (oldFiber) {
			deleteRemainingChildren(oldFiber)
		}
		return
	}

	if (oldFiber == null) {
		for (; newIndex < elements.length; newIndex++) {
			const newFiber = createChild(workInProgressFiber, elements[newIndex])

			lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)

			if (newIndex === 0) {
				workInProgressFiber.child = newFiber
			} else {
				prevSibling.sibling = newFiber
			}

			prevSibling = newFiber
		}

		return
	}

	const existingChildren = mapRemainingChilden(oldFiber)

	for (; newIndex < elements.length; newIndex++) {
		const newFiber = updateFromMap(
			existingChildren,
			workInProgressFiber,
			newIndex,
			elements[newIndex]
		)
		if (newFiber.alternate !== null) {
			existingChildren.delete(newFiber.key || newIndex)
		}

		lastPlacedIndex = placeChild(newFiber, lastPlacedIndex, newIndex)

		if (newIndex === 0) {
			workInProgressFiber.child = newFiber
		} else {
			prevSibling.sibling = newFiber
		}

		prevSibling = newFiber
	}

	existingChildren.forEach(child => deleteChild(child))
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
let workInProgressFiber = null
let hookIndex = null

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
	console.log(fiber.effectTag)

	let parentDomFiber = fiber.parent
	while (!parentDomFiber.dom) {
		parentDomFiber = parentDomFiber.parent
	}
	const parentDom = parentDomFiber.dom

	if (fiber.effectTag === PLACEMENT && fiber.dom !== null) {
		const sibling = getHostSibling(fiber)

		insertOrAppendPlacementNode(parentDom, fiber.dom, sibling)
	} else if (fiber.effectTag === UPDATE && fiber.dom !== null) {
		updateDom(fiber.dom, fiber.alternate.props, fiber.props)
	} else if (fiber.effectTag === DELETION) {
		commitDeletion(parentDom, fiber)
		return
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

export default { render, useState }
