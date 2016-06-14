var fs = require('fs')
var tapSummary = require('..')

fs.createReadStream(__dirname + '/unnamed-test.tap')
  .pipe(tapSummary())
  .pipe(process.stdout)
