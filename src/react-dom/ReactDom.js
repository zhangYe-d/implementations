import {
	Placement,
	Update,
	ChildDeletion,
	PlacementAndUpdate,
	NoFlag,
} from './ReactFiberFlags.js'
import { HostRoot, HostComponent, FunctionComponent } from './ReactFiberTags.js'

const isEvent = propName => propName.startsWith('on')
const isStyle = propName => propName === 'style'
const isProperty = propName =>
	propName !== 'children' && !isStyle(propName) && !isEvent(propName)
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

	if (fiber.props.style) {
		Object.keys(fiber.props.style).forEach(styleName => {
			HtmlElement.style[styleName] = fiber.props.style[styleName]
		})
	}

	Object.keys(fiber.props)
		.filter(isEvent)
		.forEach(propName => {
			const eventType = propName.toLowerCase().substring(2)
			HtmlElement.addEventListener(eventType, fiber.props[propName])
		})

	return HtmlElement
}

const prepareUpdate = (dom, prevProps, nextProps) => {
	let updateQueue = null
	let style = null
	const prevStyle = prevProps.style || {}
	const nextStyle = nextProps.style || {}

	Object.keys(prevProps)
		.filter(isProperty)
		.filter(isGone(prevProps, nextProps))
		.forEach(propName => {
			if (updateQueue === null) {
				updateQueue = []
			}
			updateQueue.push(propName)
			updateQueue.push('')
		})

	Object.keys(prevStyle)
		.filter(isGone(prevStyle, nextStyle))
		.forEach(styleName => {
			if (updateQueue === null) {
				style = []
			}
			style.push(styleName)
			style.push('')
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

	Object.keys(nextStyle)
		.filter(isNew(prevStyle, nextStyle))
		.forEach(styleName => {
			if (updateQueue === null) {
				style = []
			}
			style.push(styleName)
			style.push(nextStyle[styleName])
		})

	Object.keys(nextProps)
		.filter(isEvent)
		.filter(isNew(prevProps, nextProps))
		.forEach(propName => {
			const eventType = propName.toLowerCase().substring(2)
			dom.addEventListener(eventType, nextProps[propName])
		})

	Object.keys(nextProps)
		.filter(isProperty)
		.filter(isNew(prevProps, nextProps))
		.forEach(propName => {
			if (updateQueue === null) {
				updateQueue = []
			}
			updateQueue.push(propName)
			updateQueue.push(nextProps[propName])
		})

	if (style) {
		updateQueue ||= []
		updateQueue.push('style')
		updateQueue.push(style)
	}

	return updateQueue
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
			tag: currentRoot.tag,
			flags: NoFlag,
			deletions: null,
			firstEffect: null,
			lastEffect: null,
		}
		nextUnitOfWork = workInProgressRoot
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

	return fiber.child
}

const updateHostComponent = fiber => {
	reconciliationChildren(fiber, fiber.props.children)
	return fiber.child
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
		deletions: null,
		flags: Placement,
		tag: element.type instanceof Function ? FunctionComponent : HostComponent,
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
		deletions: null,
		flags: NoFlag,
		tag: oldFiber.tag,
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
			newFiber.flags |= Placement
			return lastPlacedIndex
		} else {
			return oldIndex
		}
	} else {
		return lastPlacedIndex
	}
}

const deleteChild = (parentFiber, fiber) => {
	if (parentFiber.deletions === null) {
		parentFiber.deletions = []
		parentFiber.flags |= ChildDeletion
	}

	parentFiber.deletions.push(fiber)
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
			deleteChild(workInProgressFiber, oldFiber)
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

	existingChildren.forEach(child => deleteChild(workInProgressFiber, child))
}

const appendAllChildren = (parentNode, fiber) => {
	let currentFirstChild = fiber
	while (currentFirstChild) {
		if (currentFirstChild.dom) {
			parentNode.appendChild(currentFirstChild.dom)
			currentFirstChild.flags &= ~Placement
		} else {
			appendAllChildren(parentNode, currentFirstChild.child)
		}

		currentFirstChild = currentFirstChild.sibling
	}
}

const markEffect = nextEffect => {
	if (
		nextEffect.parent &&
		(nextEffect.parent.flags & Placement) !== NoFlag &&
		nextEffect.flags === Placement
	) {
		return
	}

	if (workInProgressRoot.firstEffect === null) {
		workInProgressRoot.firstEffect = nextEffect
		workInProgressRoot.lastEffect = nextEffect
	} else {
		workInProgressRoot.lastEffect.nextEffect = nextEffect
		workInProgressRoot.lastEffect = nextEffect
	}
}

const beginWork = fiber => {
	switch (fiber.tag) {
		case FunctionComponent:
			return updateFunctionComponent(fiber)
		case HostComponent:
			return updateHostComponent(fiber)
		case HostRoot:
			return updateHostComponent(fiber)
		default:
			break
	}
}

const completeWork = (current, unitOfWork) => {
	if (current) {
		const newProps = unitOfWork.props
		const oldProps = current.props

		if (unitOfWork.dom) {
			const updateQueue = prepareUpdate(unitOfWork.dom, oldProps, newProps)
			unitOfWork.updateQueue = updateQueue

			if (updateQueue) {
				unitOfWork.flags |= Update
			}
		}
	} else {
		switch (unitOfWork.tag) {
			case FunctionComponent:
				break
			case HostComponent: {
				unitOfWork.dom = createDom(unitOfWork)
				appendAllChildren(unitOfWork.dom, unitOfWork.child)
				break
			}
			case HostRoot:
				break
			default:
				break
		}
	}
}

const completeUnitOfWork = unitOfWork => {
	let completedWork = unitOfWork

	do {
		completeWork(completedWork.alternate, completedWork)

		if (completedWork.flags !== NoFlag) {
			markEffect(completedWork)
		}

		if (completedWork.sibling) {
			return completedWork.sibling
		}

		if (completedWork.parent) {
			completedWork = completedWork.parent
		} else {
			return null
		}
	} while (true)
}

const performUnitOfWork = fiber => {
	let next = beginWork(fiber)
	if (next) {
		return next
	} else {
		return completeUnitOfWork(fiber)
	}
}

let nextUnitOfWork = null
let workInProgressRoot = null
let currentRoot = null
let workInProgressFiber = null
let hookIndex = null

const commitDeletion = fiber => {
	if (fiber.dom) {
		fiber.dom.parentNode.removeChild(fiber.dom)
	} else {
		commitDeletion(fiber.child)
	}
}

const commitPlacement = (parentDom, fiber) => {
	if (fiber.dom) {
		const sibling = getHostSibling(fiber)
		insertOrAppendPlacementNode(parentDom, fiber.dom, sibling)
	} else {
		commitPlacement(parentDom, fiber.child)
	}
}

const commitUpdate = (dom, updateQueue) => {
	for (let i = 0; i < updateQueue.length; i += 2) {
		if (updateElement[i] === 'style') {
			const style = updateQueue[i]
			for (let j = 0; j < style.length; j += 2) {
				const styleName = style[j]
				const styleValue = style[j + 1]
				dom.style[styleName] = styleValue
			}
		} else {
			const propName = updateQueue[i]
			const propValue = updateQueue[i + 1]
			dom[propName] = propValue
		}
	}
}

const commitWork = effectToCommit => {
	if (!effectToCommit) {
		return
	}

	let parentDomFiber = effectToCommit.parent
	while (!parentDomFiber.dom) {
		parentDomFiber = parentDomFiber.parent
	}
	const parentDom = parentDomFiber.dom

	if ((effectToCommit.flags & ChildDeletion) !== NoFlag) {
		effectToCommit.deletions.forEach(commitDeletion)
		effectToCommit.flags &= ~ChildDeletion
	}

	switch (effectToCommit.flags) {
		case Placement: {
			commitPlacement(parentDom, effectToCommit)
			effectToCommit.flags &= ~Placement
			break
		}
		case PlacementAndUpdate: {
			commitPlacement(parentDom, effectToCommit)
			effectToCommit.flags &= ~Placement
			commitUpdate(effectToCommit.dom, effectToCommit.updateQueue)
			effectToCommit.flags &= ~Update
			break
		}
		case Update: {
			commitUpdate(effectToCommit.dom, effectToCommit.updateQueue)
			effectToCommit.flags &= ~Update
			break
		}

		default:
			break
	}

	commitWork(effectToCommit.nextEffect)
}

const commitRoot = () => {
	commitWork(workInProgressRoot.firstEffect)

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
		flags: NoFlag,
		tag: HostRoot,
		firstEffect: null,
		lastEffect: null,
		deletions: null,
	}

	nextUnitOfWork = workInProgressRoot
}

export default { render, useState }
