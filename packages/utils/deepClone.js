/**
 * 深拷贝
 * @param {any} object 被拷贝的对象
 */
function deepClone(object, map = new Map()) {
	if (typeof object !== 'object') {
		return object
	}

	if (map.get(object)) {
		return map.get(object)
	}

	let result = {}
	if (Array.isArray(object)) {
		result = []
	}
	// 防止对象循环引用
	map.set(object, result)

	for (let key in object) {
		if (Object.hasOwn(object, key)) {
			result[key] = deepClone(object[key], map)
		}
	}

	return result
}
