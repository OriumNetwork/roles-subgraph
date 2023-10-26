const config = require('@oriumnetwork/orium-commons/lint/eslint-config')
config.rules['@typescript-eslint/ban-types'] = ['warn', { types: { BigInt: false }, extendDefaults: true }]
config.rules['@typescript-eslint-no-non-null-assertion'] = ['off']
module.exports = config
