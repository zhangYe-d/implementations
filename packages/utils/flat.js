function flat(array, depth = 1) {
	if (depth > 0) {
		return array.reduce((pre, cur) => {
			return pre.concat(Array.isArray(cur) ? flat(cur, depth - 1) : cur)
		}, [])
	}

	return [...array]
}

// test

console.log(flat([[1, 2], 3, [[4, 5], 6]]))
