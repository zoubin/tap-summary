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
        --plan === 5 ? 2 : 1
      )
      if (plan) {
        NEXT()
      } else {
        console.log('DONE')
        t.end()
      }
    })
  })()
})

test('promise support', function(t) {
  var plan = 10
  t.equal(
    math.add(0.34, 0.01),
    0.35
  )
  t.equal(
    math.add(1.1111, -1.11),
    0.0011
  )
  // the test will end when the returned promise resolves
  return new Promise(function (rs) {
    (function NEXT() {
      next(function () {
        t.equal(
          math.add(1, 2),
          --plan === 5 ? 2 : 3
        )
        if (plan) {
          NEXT()
        } else {
          console.log('DONE')
          rs()
        }
      })
    })()
  })
})

test('callback support', function(t, cb) {
  next(function () {
    t.equal(
      math.add(0.34, 0.01),
      0.35
    )
    cb()
  })
})

test('check `https://github.com/zoubin/task-tape` for more information', function(t) {
  t.task(function (cb) {
    next(function () {
      t.equal(
        math.precision(0.1),
        1
      )
      cb()
    })
  })
})

function next(fn) {
  setTimeout(function() {
    fn()
  }, 100)
}

