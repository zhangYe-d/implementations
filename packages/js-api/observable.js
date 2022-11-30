class Subscription {
	constructor() {
		this.teardowns = new Set()
	}

	add(teardown) {
		this.teardowns.add(teardown)
	}

	unSubscribe() {
		for (const teardown of this.teardowns) {
			teardown()
		}

		this.teardowns.clear()
	}
}

class SafeSubscriber {
	constructor(observer, subscription) {
		this.completed = false
		this.observer = observer
		this.subscription = subscription
	}

	next(value) {
		if (!this.completed) {
			this.observer?.next(value)
		}
	}

	complete() {
		if (!this.completed) {
			this.completed = true
			this.observer?.complete()
			this.subscription.unSubscribe()
		}
	}
}

export default class Observable {
	constructor(wrapFunction) {
		this.wrapFunction = wrapFunction
	}

	subscribe(observer) {
		const subscription = new Subscription()
		const subscriber = new SafeSubscriber(observer, subscription)

		subscription.add(this.wrapFunction(subscriber))

		return subscription
	}
}
