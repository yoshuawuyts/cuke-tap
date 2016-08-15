const path = require('path')

const cukeTap = require('../')

const features = path.join(__dirname, 'example.feature')
const steps = require('./steps')

cukeTap({ steps, features })
