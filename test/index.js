const path = require('path')

const cukeTap = require('../')

const feature = path.join(__dirname, 'spec.feature')
const featureTest = require('./spec')

cukeTap(feature, featureTest)
