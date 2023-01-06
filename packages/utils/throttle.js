function throttle(fn, wait) {
	let timeout

	return function () {
		const context = this
		const args = arguments

		if (!timeout) {
			timeout = setTimeout(() => {
				timeout = null
				fn.apply(context, args)
			}, wait)
		}
	}
}
