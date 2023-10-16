const config = require('@oriumnetwork/orium-commons/lint/eslint-config')
config.rules['@typescript-eslint/ban-types'] = ['warn', { types: { BigInt: false }, extendDefaults: true }]
module.exports = config
