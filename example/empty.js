// https://gist.github.com/Hypercubed/f0e4514bc9aec5cc5c9e814bbc1dab2d
// f431390d24fa067fb262d4ea03de3d77911b95bf
var test = require('tape')
var math = require('./math')

test('t.plan', function(t) {
  t.plan(3)

  t.equal(
    math.toFixed(2.385, 2),
    '2.39'
  )
  next(function () {
    t.whatIsThisFunction();  // causes an uncaught error
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

function next(fn) {
  setTimeout(function() {
    fn()
  }, 100)
}
