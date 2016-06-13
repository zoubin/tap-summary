var test = require('tape')
var screen = require('../lib/screen')
var reporter = require('../lib/reporter')
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var concat = require('concat-stream')

test('screen.summary ansi', function (t) {
  fs.createReadStream(fixtures('tape.summary.tap'))
    .pipe(screen({ duration: false, progress: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('screen.summary.ansi.expected'), 'utf8'))
      t.end()
    }))
})

test('screen.summary no ansi', function (t) {
  fs.createReadStream(fixtures('tape.summary.tap'))
    .pipe(screen({ duration: false, progress: false, ansi: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('screen.summary.noansi.expected'), 'utf8'))
      t.end()
    }))
})

test('screen.fail', function (t) {
  var formatter = new screen.Formatter({ duration: false, progress: false })
  formatter.prettifyError = function (assertion) {
    var lines = assertion.error.raw.split('\n')
    lines.pop()
    return lines.join('\n')
  }
  fs.createReadStream(fixtures('tape.fail.tap'))
    .pipe(reporter(formatter))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('screen.fail.expected'), 'utf8'))
      t.end()
    }))
})

test('screen.comment', function (t) {
  fs.createReadStream(fixtures('tape.comment.tap'))
    .pipe(screen({ duration: false, progress: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('screen.comment.expected'), 'utf8'))
      t.end()
    }))
})

