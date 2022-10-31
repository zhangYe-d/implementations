let workInProgressHook = null
let curentRenderedFiber = null
let currentHook = null

const renderWithHook = fiber => {
	workInProgressHook = null
	curentRenderedFiber = fiber
	currentHook = null
}

const mountWorkInProgressHook = () => {
	const hook = {
		memoisedState: null,
		baseState: null,
		baseQueue: null,
		queue: null,
		next: null,
	}

	if (workInProgressHook === null) {
		curentRenderedFiber.memoizedState = workInProgressHook = hook
	} else {
		workInProgressHook = workInProgressHook.next = hook
	}

	return workInProgressHook
}

const updateWorkInProgressHook = () => {
	let nextCurrentHook = null

	if (currentHook === null) {
		nextCurrentHook = curentRenderedFiber.alternate.memoizedState
	} else {
		nextCurrentHook = currentHook.next
	}

	currentHook = nextCurrentHook

	const newHook = {
		memoizedState: currentHook.memoizedState,
		baseState: currentHook.baseState,
		baseQueue: currentHook.baseQueue,
		queue: currentHook.queue,
		next: null,
	}

	if (workInProgressHook === null) {
		workInProgressHook = curentRenderedFiber.memoizedState = newHook
	} else {
		workInProgressHook = workInProgressHook.next = newHook
	}

	return workInProgressHook
}

const dispatchReducerAction = (fiber, queue, action) => {
	const update = {
		action,
		next: null,
	}

	if (queue.pendding === null) {
		update.next = update
	} else {
		update.next = update.pendding.next
		update.pendding.next = update
	}

	queue.pendding = update
}

const mountReducer = (reducer, initialArg, init) => {
	const hook = mountWorkInProgressHook()

	const initial = init ? init(initialArg) : initialArg
	hook.memoisedState = hook.baseState = initial

	const queue = {
		pendding: null,
		lastRenderReducer: reducer,
		lastRenderState: initial,
		dispatch: null,
	}

	const dispatch = (queue.dispatch = dispatchReducerAction.bind(
		null,
		curentRenderedFiber,
		queue
	))

	return [hook.memoizedState, dispatch]
}

const updateReducer = (reducer, initialArg, init) => {
	const hook = updateWorkInProgressHook()
	hook.memoizedState = currentHook.queue.lastRenderState

	let penddingQueue = currentHook.queue.pendding.next
	currentHook.queue.pendding.next = null
	const lastRenderReducer = currentHook.queue.lastRenderReducer

	while (penddingQueue) {
		hook.memoizedState = lastRenderReducer(hook.memoisedState, action)

		penddingQueue = penddingQueue.next
	}

	hook.queue = {
		pendding: null,
		lastRenderReducer: reducer,
		lastRenderState: hook.memoizedState,
		dispatch: null,
	}

	const dispatch = (queue.dispatch = dispatchReducerAction.bind(
		null,
		curentRenderedFiber,
		queue
	))

	return [hook.memoizedState, dispatch]
}

const BasicReducer = (state, action) => {
	return typeof action === 'function' ? action(state) : action
}

const mountState = initialState => {
	const hook = mountWorkInProgressHook()

	hook.memoizedState =
		typeof initialState === 'function' ? initialState() : initialState

	const queue = {
		pendding: null,
		lastRenderReducer: BasicReducer,
		lastRenderState: hook.memoizedState,
		dispatch: null,
	}

	const dispatch = (update.dispatch = dispatchReducerAction.bind(
		null,
		curentRenderedFiber,
		queue
	))

	return [hook.memoizedState, dispatch]
}

const updateState = state => {
	return updateReducer(BasicReducer, state)
}

export {}
