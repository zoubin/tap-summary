var exec = require('child_process').exec

var tapeCmd = require.resolve('../node_modules/task-tape/bin/task-tape')
var tapCmd = require.resolve('../bin/cmd')
var tests = require.resolve('./test')

exec([tapeCmd, tests, '|', tapCmd].join(' ')).stdout.pipe(process.stdout)

