var test = require('tape')
var math = require('./math')

test('pass', function(t) {
  t.plan(3)

  t.equal(
    math.toFixed(2.385, 2),
    '2.39'
  )
  next(function () {
    t.equal(
      math.toFixed(2.384, 2),
      '2.38'
    )
    t.equal(
      math.toFixed(2, 2),
      '2.00'
    )
  })
})

test('fail', function(t) {
  t.equal(
    math.precision(0),
    0
  )
  t.equal(
    math.precision(0.1),
    1
  )
  var plan = 10
  ;(function NEXT() {
    next(function () {
      t.equal(
        math.precision(0.1),
        --plan % 5 === 0 ? 2 : 1
      )
      if (plan) {
        NEXT()
      } else {
        t.end()
      }
    })
  })()
})

test('comment', function (t) {
  next(function () {
    t.ok(true, 'should pass')
    console.log('This is something from `console.log`')
    t.end()
  })
})

function next(fn) {
  setTimeout(fn, 100)
}
