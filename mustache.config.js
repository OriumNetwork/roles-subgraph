const Mustache = require('mustache')
const fs = require('fs')

// receive network name as argument
async function main(args) {
  const networkName = getNetworkName(args)
  const networkData = require(`./config/${networkName}.json`)
  const template = fs.readFileSync('./subgraph.template.yaml', 'utf8')
  const parsedData = putFirstElementFlag(networkData)
  const output = Mustache.render(template, parsedData)
  writeOutput(output)
}

function getNetworkName(args) {
  if (args.length < 3) {
    throw new Error('Missing network name argument')
  }
  return args[2]
}

function writeOutput(output) {
  fs.writeFileSync('./subgraph.yaml', output)
}

function putFirstElementFlag(data) {
  const dataWithFirstElementFlag = replaceFirstElementFlag(data)
  return arrayToObj(dataWithFirstElementFlag)
}
function replaceFirstElementFlag(data) {
  return Object.keys(data).map((key, index) => {
    if (Array.isArray(data[key]) && data[key].length > 0) {
      return {
        [key]: data[key].map((item, index) => {
          if (index === 0) {
            return { ...item, isFirstElement: true }
          } else {
            return item
          }
        }),
      }
    }
    return { [key]: data[key] }
  })
}

function arrayToObj(data) {
  return data.reduce((acc, curr) => {
    return { ...acc, ...curr }
  }, {})
}

main(process.argv)
  .then(() => {
    console.log('Done')
    process.exit()
  })
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
