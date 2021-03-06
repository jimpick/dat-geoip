const path = require('path')
const hypertrie = require('hypertrie')
const ip = require('ip')

const db = hypertrie('./db', {valueEncoding: 'json'})

const lookupIp = process.argv[2]

if (!lookupIp) {
  console.error(`Usage: ${path.basename(process.argv[1])} <ipv4 address>`)
  process.exit(1)
}

if (!ip.isV4Format(lookupIp)) {
  console.error(`Only IPv4 addresses currently supported`)
  process.exit(1)
}

db.ready(() => {
  const ipBuffer = ip.toBuffer(lookupIp)
  // console.log(ipBuffer)
  const prefix = `ipv4/${ipBuffer[0]}/${ipBuffer[1]}/${ipBuffer[2]}`
  scanPrefix(prefix, (err, record) => {
    if (err) {
      console.error('Error', err)
      process.exit(1)
    }
    if (!record) {
      console.log('No match')
      process.exit(0)
    }
    // console.log(record)
    db.get(`geoname/en/${record.geonameId}`, (err, data) => {
      if (err) {
        console.error('Error', err)
        process.exit(1)
      }
      const result = {ip: lookupIp, ...record, ...data.value}
      console.log(result)
    })
  })
})

function scanPrefix (prefix, cb) {
  // console.log('Jim1', prefix)
  scan(prefix, (err, list) => {
    if (err) return cb(err)
    if (list && list.length > 0) {
      list = list.filter(result => {
        const {network} = result.value
        // console.log('Jim', network)
        return ip.cidrSubnet(network).contains(lookupIp)
      })
    }
    if (!list || list.length === 0) {
      // console.log('No results')
      prefix = prefix.replace(/\/\d+$/, '')
      if (prefix === 'ipv4') {
        cb(null)
      } else {
        scanPrefix(prefix, cb)
      }
    } else {
      cb(null, list[0].value)
    }
  })
}

function scan (prefix, cb) {
  // console.log(`Scanning Prefix: ${prefix}`)
  db.list(prefix, {recursive: true}, (err, list) => {
    cb(null, list)
  })
}
