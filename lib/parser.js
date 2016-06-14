var parser = require('tap-out')
var Duplex = require('stream').Duplex

module.exports = function () {
  var tap = parser()
  var dup = Duplex()
  dup._read = function () {}
  dup._write = function (buf, enc, next) {
    tap.write(buf)
    next()
  }
  dup.on('finish', function () {
    tap.end()
  })

  var test
  var duration = 0

  function handleTestEnd() {
    if (test) {
      test.end = new Date()
      test.duration = test.end - test.start
      duration += test.duration
      dup.emit('test.end', test)
    }
  }

  function ensureTest(name) {
    if (name || !test) {
      test = {
        name: name || 'unnamed test',
        pass: 0,
        fail: 0,
        start: new Date(),
      }
      dup.emit('test.start', test)
    }
  }

  tap.on('test', function (res) {
    handleTestEnd()
    ensureTest(res.name)
  })

  tap.on('pass', function (assertion) {
    ensureTest()
    ++test.pass
    dup.emit('test.pass', test, assertion)
  })

  tap.on('fail', function (assertion) {
    ensureTest()
    ++test.fail
    dup.emit('test.fail', test, assertion)
  })

  tap.on('output', function (res) {
    handleTestEnd()
    dup.emit(
      'summary',
      {
        duration: duration,
        planned: res.plans.reduce(function (p, c) {
          return c.to - c.from + 1 + p;
        }, 0),
        assertions: res.asserts.length,
        pass: res.pass.length,
        fail: res.fail.length,
        comments: res.comments.length,
      },
      res.fail.reduce(function (o, assertion) {
        var name = getTest(assertion.test, res.tests).name
        o[name] = o[name] || []
        o[name].push(assertion)
        return o
      }, {}),
      res.comments.reduce(function (o, assertion) {
        var name = getTest(assertion.test, res.tests).name
        o[name] = o[name] || []
        o[name].push(assertion.raw)
        return o
      }, {}),
      res
    )
  })

  return dup
}

function getTest(n, tests) {
  for (var i = 0, len = tests.length; i < len; ++i) {
    if (~~n === tests[i].number) {
      return tests[i]
    }
  }
  return null
}
