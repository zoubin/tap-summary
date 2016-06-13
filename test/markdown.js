var test = require('tape')
var markdown = require('../lib/markdown')
var reporter = require('../lib/reporter')
var fs = require('fs')
var path = require('path')
var fixtures = path.resolve.bind(path, __dirname, 'fixtures')
var concat = require('concat-stream')

test('markdown.summary', function (t) {
  fs.createReadStream(fixtures('tape.summary.tap'))
    .pipe(markdown({ duration: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('markdown.summary.expected'), 'utf8'))
      t.end()
    }))
})

test('markdown.fail', function (t) {
  var formatter = new markdown.Formatter({ duration: false })
  formatter.prettifyError = function (assertion) {
    var lines = assertion.error.raw.split('\n')
    lines.pop()
    return lines.join('\n')
  }
  fs.createReadStream(fixtures('tape.fail.tap'))
    .pipe(reporter(formatter))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('markdown.fail.expected'), 'utf8'))
      t.end()
    }))
})

test('markdown.comment', function (t) {
  fs.createReadStream(fixtures('tape.comment.tap'))
    .pipe(markdown({ duration: false }))
    .pipe(concat({ encoding: 'string' }, function (s) {
      t.equal(s, fs.readFileSync(fixtures('markdown.comment.expected'), 'utf8'))
      t.end()
    }))
})

