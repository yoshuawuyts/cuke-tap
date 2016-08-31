const fs = require('fs')
const tape = require('tape')
const defaultTapeStream = require('tape/lib/default_stream')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const onEnd = require('pull-stream/sinks/on-end')
const window = require('global/window')
var Gherkin = require('gherkin')

// Grrrrrrrrrrrrr
if (window && window.Gherkin) {
  Gherkin = window.Gherkin
}
module.exports = cukeTap

// Gherkin tap producing test harness
// (str) -> null
function cukeTap (options, cb) {
  const steps = options.steps
  const features = options.features
  pull(
    featureSource(features),
    parseGherkin(),
    compilePickles(),
    runTests(steps),
    onEnd(cb || ifErrThrow)
  )
}

function isArrayOfArrays (thing) {
  if (Array.isArray(thing)) {
    return Array.isArray(thing[0])
  }
  return false
}

function featureSource (features) {
  if (isArrayOfArrays(features)) {
    return values(features)
  } else {
    return pull(
      typeof features === 'string'
        ? require('pull-glob')(features)
        : values(features)
      ,
      readFiles()
    )
  }
}

function readFiles () {
  return asyncMap(function (featurePath, cb) {
    fs.readFile(featurePath, 'utf8', function (err, featureSource) {
      if (err) cb(err)
      else cb(null, [featurePath, featureSource])
    })
  })
}

function parseGherkin () {
  const parser = new Gherkin.Parser()

  return map(function (args) {
    const featurePath = args[0]
    const featureSource = args[1]
    const gherkinDocument = parser.parse(featureSource)
    return [featurePath, gherkinDocument]
  })
}

function compilePickles () {
  const compiler = new Gherkin.Compiler()

  return map(function (args) {
    const featurePath = args[0]
    const gherkinDocument = args[1]
    const pickles = compiler.compile(gherkinDocument, featurePath)
    return pickles
  })
}

function runTests (steps) {
  return asyncMap(function (pickles, cb) {
    const world = {}
    const test = tape.createHarness()

    for (var i = 0; i < pickles.length; i++) {
      const pickle = pickles[i]
      test(pickle.name, function (t) { t.end() })

      const pSteps = pickle.steps
      for (var j = 0; j < pSteps.length; j++) {
        const step = pSteps[j]
        const result = matchStep(steps, step)
        const err = result[0]
        const match = result[1]
        if (err) return cb(err)

        test(step.text, function (t) {
          match.fn(t, world, match.params)
        })
      }
    }

    test.onFinish(cb)
    test.createStream()
      .pipe(defaultTapeStream())
  })
}

// find a step within an array of steps
// [obj] -> obj
function matchStep (steps, step) {
  var match
  steps.find(function (s) {
    const regex = s[0]
    const fn = s[1]
    const matchGroup = regex.exec(step.text)
    if (matchGroup) {
      match = { fn: fn, params: matchGroup }
    }
  })
  if (!match) return [new Error(`step "${step.text}" did not match any known steps`)]
  return [null, match]
}

function ifErrThrow (err) {
  if (err) throw err
}
