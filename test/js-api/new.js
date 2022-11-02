import newFunc from '../../src/js-api/new.js'

function Person(name, age) {
	this.name = name
	this.age = age

	this.getName = function getName() {
		console.log(`my name is ${this.name}`)
	}
}

Person.prototype.getAge = () => {
	console.log('age age!')
}

let foo = newFunc(Person, 'foo', 18)

console.log('name:', foo.getName())
console.log('age:', foo.getAge())
