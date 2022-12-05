// import newFunc from '../../src/js-api/new.js'

// function Person(name, age) {
// 	this.name = name
// 	this.age = age

// 	this.getName = function getName() {
// 		console.log(`my name is ${this.name}`)
// 	}
// }

// Person.prototype.getAge = () => {
// 	console.log('age age!')
// }

// let foo = newFunc(Person, 'foo', 18)

// console.log('name:', foo.getName())
// console.log('age:', foo.getAge())

var convert = function (s, numRows) {
	const length = s.length
	const rows = numRows
	if (length === rows || rows === 1) {
		return s
	}

	const t = 2 * rows - 2
	const c = Math.ceil(length / t)
	const cols = c * (rows - 1)
	const matrix = new Array(rows).fill(0).map(() => new Array(cols).fill(''))

	console.log('matrix: ', matrix)

	let col = 0
	let row = 0
	for (let i = 0; i < length; i++) {
		console.log('(row, col): ', `(${row}, ${col})`)
		matrix[row][col] = s.charAt(i)

		if (i % t < rows - 1) {
			row++
		} else {
			row--
			col++
		}
	}

	let result = ''

	for (row = 0; row < rows; row++) {
		for (col = 0; col < cols; col++) {
			let char = matrix[row][col]

			if (char !== '') {
				result += char
			}
		}
	}

	return result
}

let a = convert('PAYPALISHIRING', 3)
console.log('ans: ', a)
