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

  function startTest(name) {
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
    startTest(res.name)
  })

  tap.on('assert', function (assertion) {
    startTest()
    if (assertion.ok) {
      ++test.pass
    } else {
      ++test.fail
    }
    dup.emit('test.assert', assertion, test)
  })

  tap.on('output', function (res) {
    handleTestEnd()

    var stats = {
      duration: duration,
      planned: res.plans.reduce(function (p, c) {
        return c.to - c.from + 1 + p;
      }, 0),
      assertions: res.asserts.length,
      pass: res.pass.length,
      fail: res.fail.length,
      comments: res.comments.length,
    }
    dup.failed = !!stats.fail
    var planned = stats.planned
    if (planned < 1) {
      dup.failed = true
      stats.planned = new Error('NA (plans must appear once in output)')
      stats.planned.raw = planned
    } else if (stats.assertions !== stats.planned) {
      dup.failed = true
      stats.planned = new Error(planned + "(plans don't match final assertions)")
      stats.planned.raw = planned
    }

    var fails = null
    var comments = null
    if (stats.fail) {
      fails = res.fail.reduce(function (o, assertion) {
        var name = getTest(assertion.test, res.tests).name
        o[name] = o[name] || []
        o[name].push(assertion)
        return o
      }, {})
    }
    if (stats.comments) {
      comments = res.comments.reduce(function (o, assertion) {
        var name = getTest(assertion.test, res.tests).name
        o[name] = o[name] || []
        o[name].push(assertion.raw)
        return o
      }, {})
    }

    dup.emit('summary', stats, fails, comments)
    dup.push('\n\n')
    dup.push(null)
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
