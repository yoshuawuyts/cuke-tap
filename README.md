# cuke-tap
[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![Downloads][downloads-image]][downloads-url]
[![js-standard-style][standard-image]][standard-url]

Cucumber BDD tests, TAP style. `cuke-tap` provides a minimal interface to
perform `cucumber`-style integration tests.

## Installation
```sh
$ npm install cuke-tap
```

## Usage
__test/visit.feature__
```feature
Feature: Example feature
  As a user of cucumber.js
  I want to have documentation on cucumber
  So that I can concentrate on building awesome applications

  Scenario: Reading documentation
    Given I am on the cuke-tap repo page
    When I go to the README file
    Then I should see "Usage" as the page title
```

__test/steps.js__
```js
const test = require('cuke-tap')
const jsdom = require('jsdom')

test.given(/^I am on the cuke-tap repo page$/, (t, world, params) => {
  t.plan(1)
  jsdom.env('http://localhost:1337', (err, window) => {
    t.error(err)
    world.window = window
    window.location.pathname = '/foo'
    t.pass('done')
  }
})

test.when(/^I go to the README file$/, (t, world, params) => {
  t.plan(2)
  const window = world.window
  const document = window.document
  const el = document.querySelectorAll('.foo.bar')
  t.ok(el)
  el.click()
  t.equal(window.location.pathname, '/baz')
})

test.then(/^I should see "(.*)" as the page title$/, (t, world, params) => {
  t.plan(1)
  const document = world.window.document
  t.equal(document.title, 'baz, the best beep')
})
```

__test/index.js__
```js
const cuke = require('cuke-tap')
const jsdom = require('jsdom')
const path = require('path')

const features = [ path.join(__dirname, '/feature.feature') ]
const steps = [ require('./steps') ]

cuke(features, steps)
```

## API
### cuke(features, steps, world)
Run cucumber tests.
- __features__ - an array of `.feature` files in Gherkin syntax
- __steps__ - an array of steps functions

### stepFunction(step)
Create a step function that is imported by `cuke()`. `step` is an object with
Gherkin syntax properties on it (e.g. `step.given`). Each defined step has a
signature of `(regex, cb(t, world, params))` where:
- __regex__: the regex that is matched against the gherkin definitions
- __t__: instance of tape's `t`
- __world__: a `world` object that is shared between tests
- __params__: the regex match groups

## Todo
- [x] get base version working
- [ ] add support for full syntax range (requires parser rewrite)
- [ ] add support for table tests

## See Also
- [gherkin-parser](https://github.com/yoshuawuyts/gherkin-parser)
- [tape](https://github.com/substack/tape)

## License
[MIT](https://tldrlegal.com/license/mit-license)

[npm-image]: https://img.shields.io/npm/v/cuke-tap.svg?style=flat-square
[npm-url]: https://npmjs.org/package/cuke-tap
[travis-image]: https://img.shields.io/travis/yoshuawuyts/cuke-tap/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/yoshuawuyts/cuke-tap
[codecov-image]: https://img.shields.io/codecov/c/github/yoshuawuyts/cuke-tap/master.svg?style=flat-square
[codecov-url]: https://codecov.io/github/yoshuawuyts/cuke-tap
[downloads-image]: http://img.shields.io/npm/dm/cuke-tap.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/cuke-tap
[standard-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[standard-url]: https://github.com/feross/standard
