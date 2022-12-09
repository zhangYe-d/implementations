Array.prototype.reduce = function (callback, initial) {
	const array = this
	let total = initial !== undefined ? initial : array[0]

	for (let i = initial !== undefined ? 0 : 1; i < array.length; i++) {
		total = callback(total, array[i], i, array)
	}

	return total
}

// test
;[1, 2, 3, 4].reduce((pre, cur) => pre + cur)
