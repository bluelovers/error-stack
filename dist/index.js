
'use strict'

if (process.env.NODE_ENV === 'production') {
  module.exports = require('./error-stack2.cjs.production.min.js')
} else {
  module.exports = require('./error-stack2.cjs.development.js')
}
