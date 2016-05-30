var exec = require('child_process').exec

var tapeCmd = require.resolve('../node_modules/task-tape/bin/task-tape')
var tapCmd = require.resolve('../bin/cmd')
var tests = require.resolve('./test')
var extra = '--no-ansi --no-progress'

exec([tapeCmd, tests, '|', tapCmd, extra].join(' ')).stdout.pipe(process.stdout)
