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
__test/index.js__
```js
const cuke = require('cuke-tap')
const path = require('path')

const features = path.join(__dirname, 'example.feature')
const steps = require('./steps')

cuke({ steps, features })
```

__test/example.feature__
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

module.exports = [
  [/^I am on the cuke-tap repo page$/, (t, world, params) => {
    t.plan(1)
    jsdom.env('http://localhost:1337', (err, window) => {
      t.error(err)
      world.window = window
      window.location.pathname = '/foo'
      t.pass('done')
    }
  }],
  [/^I go to the README file$/, (t, world, params) => {
    t.plan(2)
    const window = world.window
    const document = window.document
    const el = document.querySelectorAll('.foo.bar')
    t.ok(el)
    el.click()
    t.equal(window.location.pathname, '/baz')
  }],
  [/^I should see "(.*)" as the page title$/, (t, world, params) => {
    t.plan(1)
    const document = world.window.document
    t.equal(document.title, 'baz, the best beep')
  }]
]


```

## API
### cuke(options, cb)
Run cucumber tests.
- __options.features__ - either a glob string or array of file paths
  of `.feature` files in Gherkin syntax
- __options.steps__ - an array of steps
- __cb__ - an error-first callback after tests have been setup

Each defined step is an array of `[regex, fn(t, world, params)]` where:
- __regex__: the regex that is matched against the gherkin definitions
- __t__: instance of tape's `t`
- __world__: a `world` object that is shared between tests
- __params__: the regex match groups

## Todo
- [x] get base version working
- [x] add support for full syntax range (requires parser rewrite)
- [ ] add support for table tests

## See Also
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
