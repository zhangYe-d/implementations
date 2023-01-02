function debounce(fn, wait, immediate) {
	let timeout
	return function () {
		const context = this
		const args = arguments

		if (timeout) {
			clearTimeout(timeout)
		}

		if (immediate) {
			const callnow = !timeout

			timeout = setTimeout(() => {
				timeout = null
			}, wait)

			if (callnow) {
				fn.apply(context, args)
			}
		} else {
			setTimeout(() => {
				fn.apply(context, args)
			}, wait)
		}
	}
}
