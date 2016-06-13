var test = require('tape')

test('pass', function (t) {
  t.ok(true, 'should pass')
  t.end()
})

test('fail', function (t) {
  t.ok(false, 'should fail')
  t.end()
})

test('pass and fail', function (t) {
  t.ok(true, 'should pass')
  t.ok(false, 'should fail')
  t.end()
})
