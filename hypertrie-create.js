const fs = require('fs')
const hypertrie = require('hypertrie')
const parse = require('csv-parse')
const { Writable } = require('stream')

const db = hypertrie('./db', {valueEncoding: 'json'})

db.ready(() => {
  const csvIPv4Blocks = 'GeoLite2-City-CSV_20180807/GeoLite2-City-Blocks-IPv4.csv'
  const parser = parse()
  const input = fs.createReadStream(csvIPv4Blocks)
  /*
  const output = fws((data, enc, cb) => {
    console.log(data)
    cb()
  })
  */
  let counter = 0
  const output = new Writable({
    write: (data, enc, cb) => {
      const [
        network,
        geonameId,
        registeredCountryGeonameId,
        representedCountryGeonameId,
        isAnonymousProxy,
        isSatelliteProvider,
        postalCode,
        latitude,
        longitude,
        accuracyRadius
      ] = data
      const match = network.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/)
      if (match) {
        const key = `ipv4/${match[1]}/${match[2]}/${match[3]}/` +
                    `${match[4]}/${match[5]}`
        counter++
        if (counter % 1000 === 0) {
          console.log(counter, key)
        }
        // console.log(data)
        const json = {
          network,
          geonameId: Number(geonameId),
          registeredCountryGeonameId: Number(registeredCountryGeonameId),
          representedCountryGeonameId: Number(representedCountryGeonameId),
          isAnonymousProxy: !!Number(isAnonymousProxy),
          isSatelliteProvider: !!Number(isSatelliteProvider),
          postalCode,
          latitude: Number(latitude),
          longitude: Number(longitude),
          accuracyRadius: Number(accuracyRadius)
        }
        db.put(key, json, cb)
      } else {
        console.log(data)
        setTimeout(cb, 1000)
      }
    },
    objectMode: true
  })
  input.pipe(parser).pipe(output)
})
