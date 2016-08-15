const fs = require('fs')
const tape = require('tape')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const drain = require('pull-stream/sinks/drain')
const glob = require('pull-glob')
const Gherkin = require('gherkin')

module.exports = cukeTap

// Gherkin tap producing test harness
// (str) -> null
function cukeTap (options, cb) {
  const steps = options.steps
  const features = options.features

  pull(
    typeof features === 'string'
      ? glob(features)
      : values(features)
    ,
    readFiles(),
    parseGherkin(),
    compilePickles(),
    runTests(steps),
    drain(null, cb || noop)
  )
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
  return map(function (pickles) {
    const world = {}

    pickles.forEach(function (pickle) {
      tape(pickle.name, function (t) {
        pickle.steps.forEach(function (step) {
          const match = matchStep(steps, step)
          t.test(step.text, function (st) {
            match.fn(st, world, match.params)
          })
        })
      })
    })
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
      match = { fn, params: matchGroup }
    }
  })
  if (!match) throw new Error(`step "${step.text}" did not match any known steps`)
  return match
}

function noop () {}
