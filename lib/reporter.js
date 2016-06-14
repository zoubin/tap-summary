var parser = require('./parser')

module.exports = function (formatter) {
  var reporter = parser()

  formatter.init(reporter)

  reporter.on('test.end', function (test) {
    reporter.push(formatter.test(test))
  })

  reporter.on('summary', function (summary, fails, comments) {
    reporter.failed = !!summary.fail

    var planned = summary.planned
    if (planned < 1) {
      reporter.failed = true
      summary.planned = new Error('NA (plans must appear once in output)')
      summary.planned.raw = planned
    } else if (summary.assertions !== summary.planned) {
      reporter.failed = true
      summary.planned = new Error(planned + "(plans don't match final assertions)")
      summary.planned.raw = planned
    }

    reporter.push(formatter.summary(summary))

    if (summary.fail) {
      reporter.push(formatter.fail(fails))
    }
    if (summary.comments) {
      reporter.push(formatter.comment(comments))
    }
    reporter.push('\n\n')
    reporter.push(null)
  })

  return reporter
}

