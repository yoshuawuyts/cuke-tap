const test = require('../')

test.given(/^I am on the cuke-tap repo page$/, function (t, world) {
  t.plan(1)
  t.equal(typeof world, 'object')
  world.foo = 'foo'
  world.n = 0
})

test.when(/^I go to the README file$/, function (t, world, params) {
  t.plan(2)
  t.equal(world.foo, 'foo')
  t.equal(world.n, 0)
  world.n = 1
})

test.then(/^I should see "(.*)" as the page title$/, function (t, world, params) {
  t.plan(3)
  t.equal(world.n, 1)
  t.ok(Array.isArray(params), 'is array')
  t.equal(params[1], 'Usage')
})
