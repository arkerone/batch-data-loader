import { DataLoader } from '../dist/DataLoader.js'

const users = [
  {
    name: 'John',
    age: 30
  },
  {
    name: 'Jane',
    age: 27
  },
  {
    name: 'Simon',
    age: 5
  }
]

function fetchUsersByName(names) {
  return users.filter((user) => names.includes(user.name))
}

const userLoader = new DataLoader(async (keys) => {
  console.log('Fetch', keys)
  const results = fetchUsersByName(keys)
  return keys.map((key) => results.find((user) => user.name === key))
})

userLoader.load('John').then(console.log).catch(console.error)
userLoader.load('Jane').then(console.log).catch(console.error)
userLoader.load('John').then(console.log).catch(console.error)

setTimeout(() => {
  userLoader.load('unknown').then(console.log).catch(console.error)
  userLoader.load('Simon').then(console.log).catch(console.error)
}, 1000)

/*
Results :

Fetch [ 'John', 'Jane' ]
{ name: 'John', age: 30 }
{ name: 'Jane', age: 27 }
{ name: 'John', age: 30 }
Fetch [ 'unknown', 'Simon' ]
undefined
{ name: 'Simon', age: 5 }
*/
