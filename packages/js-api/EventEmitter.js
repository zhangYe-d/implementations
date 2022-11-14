export default class EventEmitter {
	constructor() {
		this.events = {}
	}

	on(event, handler) {
		let callbacks = this.events[event] || []
		callbacks.push(handler)
		this.events[event] = callbacks
	}

	off(event, handler) {
		let callbacks = this.events[event]
		this.events[event] =
			callbacks && callbacks.filter(callback => callback !== handler)
	}

	emit(event, arg) {
		if (this.events[event]) {
			this.events[event].forEach(handler => handler(arg))
		}
	}

	once(event, handler) {
		let wrapperHandler = arg => {
			handler(arg)
			this.off(event, wrapperHandler)
		}

		this.on(event, wrapperHandler)
	}
}
