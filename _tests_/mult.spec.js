const mult = require('../mult')

describe('multiplication', () => {
  test('can return multiplication of two numbers', () => {
    const a = 2
    const b = 3
    const c = mult(a, b)
    const output = a * b
    expect(output).toEqual(c)
  })
})
