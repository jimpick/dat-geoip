const fs = require('fs')
const hypertrie = require('hypertrie')
const parse = require('csv-parse')
const { Writable } = require('stream')

const db = hypertrie('./db', {valueEncoding: 'json'})

db.ready(() => {
  console.log('Loading IPv4 CSV file')
  loadIPv4(err => {
    if (err) {
      console.error('Error', err)
      process.exit(1)
    }
    console.log('IPv4 CSV file loaded')
    console.log('Loading cities CSV file')
    loadCities(err => {
      if (err) {
        console.error('Error', err)
        process.exit(1)
      }
      console.log('Cities CSV file loaded')
      console.log('Done.')
    })
  })
})

function loadIPv4 (cb) {
  const csvIPv4Blocks = 'GeoLite2-City-CSV_20180807/GeoLite2-City-Blocks-IPv4.csv'
  const parser = parse()
  const input = fs.createReadStream(csvIPv4Blocks)
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
  input.on('end', () => {
    setTimeout(cb, 1000)
  })
}

function loadCities (cb) {
  const csvCities = 'GeoLite2-City-CSV_20180807/GeoLite2-City-Locations-en.csv'
  const parser = parse()
  const input = fs.createReadStream(csvCities)
  let counter = 0
  const output = new Writable({
    write: (data, enc, cb) => {
      const [
        geonameId,
        localeCode,
        continentCode,
        continentName,
        countryIsoCode,
        countryName,
        subdivision1IsoCode,
        subdivision1Name,
        subdivision2IsoCode,
        subdivision2Name,
        cityName,
        metroCode,
        timeZone,
        isInEuropeanUnion
      ] = data
      if (geonameId !== 'geoname_id') {
        const key = `geoname/en/${geonameId}`
        counter++
        if (counter % 1000 === 0) {
          console.log(counter, key)
        }
        // console.log(data)
        const json = {
          geonameId: Number(geonameId),
          localeCode,
          continentCode,
          continentName,
          countryIsoCode,
          countryName,
          subdivision1IsoCode,
          subdivision1Name,
          subdivision2IsoCode,
          subdivision2Name,
          cityName,
          metroCode,
          timeZone,
          isInEuropeanUnion: !!Number(isInEuropeanUnion)
        }
        // console.log('JSON', json)
        db.put(key, json, cb)
      } else {
        console.log(data)
        setTimeout(cb, 1000)
      }
    },
    objectMode: true
  })
  input.pipe(parser).pipe(output)
  input.on('end', () => {
    setTimeout(cb, 1000)
  })
}
