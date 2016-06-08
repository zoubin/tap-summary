var test = require('tape')
var math = require('./math')

test('t.plan', function(t) {
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

test('t.end', function(t) {
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
        1
      )
      plan--
      if (plan) {
        NEXT()
      } else {
        console.log('DONE')
        t.end()
      }
    })
  })()
})

function next(fn) {
  setTimeout(function() {
    fn()
  }, 100)
}
