#!/usr/bin/env node

const path = require('path')
const hypercore = require('hypercore')
const hypertrie = require('hypertrie')
const hyperdiscovery = require('hyperdiscovery')
const ram = require('random-access-memory')
const datResolve = require('dat-link-resolve')
const ip = require('ip')

const cache = {}

const dbKey = '2514aeafe4ed6246bae3195bb41691f7adb8526d174bb15a063c64990ad7d146'

const db = hypertrie(ram, dbKey, {sparse: true, valueEncoding: 'json'})
db.ready(() => {
  hyperdiscovery(db, {upload: false, live: true})
  db.feed.update(run)
})


// const watchUrl = 'dat://fritter.hashbase.io' // Won't resolve?
const watchUrl = 'dat://9900f9aad4d6e79e0beb1c46333852b99829e4dfcdfa9b690eeeab3c367c1b9a'

function run () {
  datResolve(watchUrl, (err, key) => {
    if (err) {
      console.log('Error', err)
      process.exit(1)
    }
    console.log('Watch key:', key.toString('hex'))
    const feed = hypercore(ram, key, {sparse: true})
    feed.ready(() => {
      const sw = hyperdiscovery(feed, {
        live: false,
        maxConnections: 16,
        dht: false
      })
      sw.focus = true
      sw.on('connection', (peer, info) => {
        // console.log('\nConnect:', info.host)
        peer.info = info
        const host = info.host.replace(/^\:\:ffff\:/, '')
        if (cache[host]) return
        cache[host] = 'pending'
        getLocation(host, (err, geo) => {
          cache[host] = geo
          if (!geo) {
            console.log(`${host} (No location found)`)
          } else {
            console.log(`${host} ${geo.cityName} ${geo.subdivision1IsoCode} ` +
              `${geo.countryName}`)
          }
          if (err) console.log('Error', err)
        })
      })
    })
  })
}

function getLocation(host, cb) {
  if (!ip.isV4Format(host)) return cb(new Error('Unsupported'))
  const ipBuffer = ip.toBuffer(host)
  // console.log(ipBuffer)
  const prefix = `ipv4/${ipBuffer[0]}/${ipBuffer[1]}/${ipBuffer[2]}`
  scanPrefix(host, prefix, (err, record) => {
    if (err) return cb(err)
    if (!record) return cb()
    db.get(`geoname/en/${record.geonameId}`, (err, data) => {
      if (err) return cb(err)
      const result = {ip: host, ...record, ...data.value}
      cb(null, result)
    })
  })
}

function scanPrefix (host, prefix, cb) {
  // console.log('Jim1', prefix)
  scan(prefix, (err, list) => {
    if (err) return cb(err)
    if (list && list.length > 0) {
      list = list.filter(result => {
        const {network} = result.value
        // console.log('Jim', network)
        return ip.cidrSubnet(network).contains(host)
      })
    }
    if (!list || list.length === 0) {
      // console.log('No results')
      prefix = prefix.replace(/\/\d+$/, '')
      if (prefix === 'ipv4') {
        cb(null)
      } else {
        scanPrefix(host, prefix, cb)
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
