const fs = require('fs')
const tape = require('tape')
const pull = require('pull-stream/pull')
const values = require('pull-stream/sources/values')
const map = require('pull-stream/throughs/map')
const asyncMap = require('pull-stream/throughs/async-map')
const onEnd = require('pull-stream/sinks/on-end')
const glob = require('pull-glob')
const Gherkin = require('gherkin')

module.exports = cukeTap

// Gherkin tap producing test harness
// (str) -> null
function cukeTap (options, cb) {
  const features = options.features

  pull(
    typeof features === 'string'
      ? glob(features)
      : values(features)
    ,
    readFiles(),
    parseGherkin(),
    compilePickles(),
    runTests(options),
    onEnd(cb || ifErrThrow)
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
    return [gherkinDocument, pickles]
  })
}

function runTests (options) {
  const steps = options.steps
  const setup = options.setup || defaultSetup
  const teardown = options.teardown || defaultTeardown

  return asyncMap(function (args, cb) {
    const gherkinDocument = args[0]
    const pickles = args[1]

    setup(function (err, world) {
      if (err) return cb(err)

      pickles.forEach(function (pickle) {
        const matches = pickle.steps.map(function (step) {
          return [step, matchStep(steps, step)]
        })

        tape(pickle.name, function (t) {
          matches.forEach(function (args) {
            const step = args[0]
            const match = args[1]
            t.test(step.text, function (st) {
              match.fn(st, world, match.params)
            })
          })
        })
      })

      tape.onFinish(function (err) {
        console.log('teardown', err)
        teardown(err, world, cb)
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
      match = { fn: fn, params: matchGroup }
    }
  })
  if (!match) throw new Error(`step "${step.text}" did not match any known steps`)
  return match
}

function ifErrThrow (err) {
  if (err) throw err
}

function defaultSetup (cb) {
  cb(null, {})
}

function defaultTeardown (err, world, cb) {
  cb(null)
}
