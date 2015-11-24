#!/usr/bin/env node

var reporter = require('..')()

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
