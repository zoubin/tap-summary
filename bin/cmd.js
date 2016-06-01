#!/usr/bin/env node
var minimist = require('minimist')

var opts = minimist(process.argv.slice(2), {
  boolean: true,
  alias: {
    ansi: 'a',
    progress: 'p',
  },
  default: {
    ansi: true,
    progress: true,
  },
})

var reporter = require('..')(opts)

process.stdin
  .pipe(reporter)
  .pipe(process.stdout)

process.on('exit', function (status) {
  if (status === 1) {
    process.exit(1)
  }
  if (reporter.failed) {
    process.exit(1)
  }
})
