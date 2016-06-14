var test = require('tape')

test('sync', function (t) {
  t.ok(true, 'should pass')
  console.log('Hello, ')
  t.end()
})

test('async', function (t) {
  process.nextTick(function () {
    t.ok(true, 'should pass')
    console.log('world!')
    t.end()
  })
})

