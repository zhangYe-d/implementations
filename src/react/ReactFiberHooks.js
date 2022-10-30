let workInProgressHook = null
let curentFiber = null
let currentHook = null

const renderWithHook = fiber => {
	workInProgressHook = null
	curentFiber = fiber
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
		curentFiber.memoizedState = workInProgressHook = hook
	} else {
		workInProgressHook = workInProgressHook.next = hook
	}

	return workInProgressHook
}

const updateWorkInProgressHook = () => {
	let nextCurrentHook = null

	if (currentHook === null) {
		nextCurrentHook = curentFiber.alternate.memoizedState
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
		workInProgressHook = curentFiber.memoizedState = newHook
	} else {
		workInProgressHook = workInProgressHook.next = newHook
	}

	return workInProgressHook
}

const mountReducer = (reducer, initialArg, init) => {
	const hook = mountWorkInProgressHook()
}

const updateReducer = (reducer, initialArg, init) => {
	const hook = updateWorkInProgressHook()
}
