function flow(...fns) {
	if (fns.length === 1) {
		return fns[0]
	}

	return fns.reduceRight(
		(a, b) =>
			(...args) =>
				a(b(...args))
	)
}

// test

const add1 = str => str + '1'
const add2 = str => str + '2'
const add3 = str => str + '3'

const add123 = flow(add1, add2, add3)

console.log(add123('str'))
