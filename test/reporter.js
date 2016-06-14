var test = require('tape')
var reporter = require('..')
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var concat = require('concat-stream')

test('summary ansi', function (t) {
  fs.createReadStream(fixtures('summary.tap'))
    .pipe(reporter({ duration: false, progress: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('summary.ansi.expected'), 'utf8'))
      t.end()
    }))
})

test('summary no ansi', function (t) {
  fs.createReadStream(fixtures('summary.tap'))
    .pipe(reporter({ duration: false, progress: false, ansi: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('summary.noansi.expected'), 'utf8'))
      t.end()
    }))
})

test('fail', function (t) {
  reporter.Formatter.prototype.prettifyError = function (assertion) {
    var lines = assertion.error.raw.split('\n')
    lines.pop()
    return lines.join('\n')
  }
  fs.createReadStream(fixtures('fail.tap'))
    .pipe(reporter({ duration: false, progress: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('fail.expected'), 'utf8'))
      t.end()
    }))
})

test('comment', function (t) {
  fs.createReadStream(fixtures('comment.tap'))
    .pipe(reporter({ duration: false, progress: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('comment.expected'), 'utf8'))
      t.end()
    }))
})

