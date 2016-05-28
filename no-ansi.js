var LF = '\n'

var escapes = require('ansi-escape/lib/escapes')
var colors = require('ansi-escape/lib/colors')

var escape = function (x) { return x }

Object.keys(colors).forEach(function (key) {
  escape[key] = escape
})

Object.keys(escapes).forEach(function (key) {
  escape[key] = escape
})

escape.eraseLine.escape = function (x) { return x + LF}

module.exports = escape
