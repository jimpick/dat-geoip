var maxmind = require('maxmind')

maxmind.open('GeoLite2-City_20180807/GeoLite2-City.mmdb', (err, cityLookup) => {
  const ips = [
    // '66.6.44.4'
    '64.46.22.7',
    '79.0.45.22',
    '159.65.107.57',
    '88.99.3.86',
    '210.187.148.110'
  ]
  ips.forEach(ip => {
    const data = cityLookup.get(ip)
    // console.log(ip, data)
    let city = ''
    if (data && data.city) city = data.city.names.en + ', '
    console.log(`${ip} ${city}${data && data.country.names.en}`)
  })
})
