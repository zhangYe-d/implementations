const RESERVED_PROPS = {
	key: true,
	ref: true,
}

const hasValidKey = key => key !== undefined
const hasValidRef = ref => true

const createElement = (type, config, ...children) => {
	const props = {}
	let key = null
	let ref = null

	if (config !== null) {
		if (hasValidKey(config.key)) {
			key = '' + config.key
		}

		if (hasValidRef(config.ref)) {
			ref = ref
		}

		for (let propName in config) {
			if (config.hasOwnProperty(propName) && !(propName in RESERVED_PROPS)) {
				props[propName] = config[propName]
			}
		}
	}

	return {
		type,
		key,
		ref,
		props: {
			...props,
			children: children.map(child =>
				typeof child === 'object' ? child : createTextElement(child)
			),
		},
	}
}

const createTextElement = text => {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			nodeValue: text,
			children: [],
		},
	}
}

export default { createElement, createTextElement }
