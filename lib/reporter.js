var parser = require('./parser')

module.exports = function (formatter) {
  var reporter = parser()

  if (formatter.init) {
    formatter.init(reporter)
  }

  reporter.push(formatter.test())

  reporter.on('test.end', function (test) {
    reporter.push(formatter.test(test))
  })

  reporter.on('summary', function (summary, fails, comments) {
    reporter.failed = !!summary.fail
    if (summary.planned < 1) {
      reporter.failed = true
      summary.planned = 'NA (plans must appear once in output)'
    } else if (summary.assertions !== summary.planned) {
      reporter.failed = true
      summary.planned = summary.planned + "(plans don't match final assertions)"
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

