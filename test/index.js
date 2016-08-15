const path = require('path')

const test = require('tape')
const cukeTap = require('../')

const features = [path.join(__dirname, 'example.feature')]
const steps = require('./steps')

cukeTap({
  steps: steps,
  features: features
})

test('error when step does not match', function (t) {
  cukeTap({
    steps: [],
    features: features
  }, function (err) {
    if (!/^step ".*" did not match any known steps$/.test(err)) {
      t.pass('matches expected error')
    } else {
      t.fail('does not match expected error')
    }
    t.end()
  })
})

test('error when file not found', function (t) {
  cukeTap({
    steps: [],
    features: ['nope.feature']
  }, function (err) {
    t.equal(err.code, 'ENOENT', 'error is correct type')
    t.end()
  })
})
