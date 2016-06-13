#!/usr/bin/env node

var Command = require('commander').Command
var program = new Command('tap-summary')

program
  .version(require('../package.json').version)
  .option('--no-ansi', 'Disable ANSI formatting. Only valid for the default formatter.')
  .option('--no-progress', 'Disable progress output during tests. Only valid for the default formatter.')
  .option('-m, --markdown', 'Use the markdown formatter.')
  .option('-f, --formatter <formatter>', 'Specify how to format the output. `markdown` and `default` are available.')
  .parse(process.argv)

var reporter
if (program.markdown || program.formatter === 'markdown') {
  reporter = require('../lib/markdown')()
} else {
  reporter = require('..')({
    ansi: program.ansi,
    progress: program.progress,
  })
}


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
