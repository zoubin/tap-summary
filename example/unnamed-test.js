var tapSummary = require('..')
var fs = require('fs')

fs.createReadStream(__dirname + '/unnamed-test.tap')
  .pipe(tapSummary())
  .pipe(process.stdout)
