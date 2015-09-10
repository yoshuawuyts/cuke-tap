const jsonParse = require('safe-json-parse')
const gherkin = require('gherkin-parser')
const concat = require('concat-stream')
const mapLimit = require('map-limit')
const flatten = require('flatten')
const pump = require('pump')
const tape = require('tape')
const fs = require('fs')

// todo(yw): replace with global
// as used in `bole`. A single instance
// is fragile and _will_ fail.
const steps = {
  given: [],
  then: [],
  when: []
}

module.exports = cukeTap

cukeTap.given = createStep('given')
cukeTap.when = createStep('when')
cukeTap.then = createStep('then')

// Gherkin tap producing test harness
// ([str], [str]) -> null
function cukeTap (featureFiles, stepFiles) {
  featureFiles = Array.isArray(featureFiles) ? featureFiles : [ featureFiles ]
  stepFiles = Array.isArray(stepFiles) ? stepFiles : [ stepFiles ]

  readFeatures(featureFiles, function (err, features) {
    if (err) return console.log(err)
    features.forEach(runTest)
    runTest(features[0])
  })

  // run a singular test
  function runTest (f) {
    f.scenarios.forEach(function (scenario, i) {
      const arr = [ 'given', 'when', 'then' ]
      const world = {}

      arr.forEach(function (key, j) {
        const localSteps = steps[key]
        const step = scenario[key]
        const match = matchStep(localSteps, step)
        const params = match.params
        const stepCb = match.cb

        tape('\n' + step[0], function (t) {
          if (j === 0) {
            if (i === 0) featureComment(f, t)
            scenarioComment(scenario, t)
          }
          stepCb(t, world, params)
        })
      })
    })

    function featureComment (f, t) {
      if (f.perspective) t.comment('As a ' + f.perspective)
      if (f.desire) t.comment('I want ' + f.desire)
      if (f.reason) t.comment('In order ' + f.reason)
    }

    function scenarioComment (s, t) {
      t.comment('\n')
      t.comment('Scenario: ' + s.scenario)
    }

    // find a step within an array of steps
    // ([obj], str -> obj
    function matchStep (steps, str) {
      var params = null
      const step = steps.filter(function (step) {
        const _matchGroup = step.regex.exec(str)
        if (_matchGroup) params = _matchGroup
        return _matchGroup
      })[0]
      if (!step) throw new Error('step %s did not match any known steps', str)
      step.params = params
      return step
    }
  }
}

// read and parse `.feature` files
// ([str], cb([obj])) -> null
function readFeatures (features, cb) {
  const limit = 3
  mapLimit(features, limit, iterator, function (err, res) {
    if (err) return cb(err)
    return cb(null, flatten(res))
  })

  function iterator (feature, done) {
    pump(fs.createReadStream(feature), gherkin(), concat(function (buf) {
      const str = buf.toString()
      jsonParse(str, done)
    }))
  }
}

// step creator factory, giddin meta widdit
// str -> (regex, fn(obj)) -> null
function createStep (key) {
  return function (regex, fn) {
    steps[key].push({ regex: regex, cb: fn })
  }
}
