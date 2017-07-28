var test = require('tape')

function async(fn, time) {
  setTimeout(fn, time || 500)
}

async(function () {
  test('test', function (t) {
    t.ok(true, 'ok')
    t.end()
  })

  test.onFinish(function () {
    async(done)
  })
})

function done() {
  console.log('done')
}

