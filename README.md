@jimpick/dat-geoip
==================

An experiment in using hypertrie to host a peer-to-peer geo ip lookup database.

The data from [MaxMind GeoLite2](https://dev.maxmind.com/geoip/geoip2/geolite2/)
is loaded into a [hypertrie](https://github.com/mafintosh/hypertrie).

# Install

```
npm install -g @jimpick/dat-geoip
```

# Usage

There is a CLI to look up an IP address:

```
$ dat-geoip 66.6.44.4
{
  "ip": "66.6.44.4",
  "network": "66.6.32.0/20",
  "geonameId": 5128581,
  "registeredCountryGeonameId": 6252001,
  "representedCountryGeonameId": 0,
  "isAnonymousProxy": false,
  "isSatelliteProvider": false,
  "postalCode": "10010",
  "latitude": 40.7391,
  "longitude": -73.9826,
  "accuracyRadius": 1000,
  "localeCode": "en",
  "continentCode": "NA",
  "continentName": "North America",
  "countryIsoCode": "US",
  "countryName": "United States",
  "subdivision1IsoCode": "NY",
  "subdivision1Name": "New York",
  "subdivision2IsoCode": "",
  "subdivision2Name": "",
  "cityName": "New York",
  "metroCode": "501",
  "timeZone": "America/New_York",
  "isInEuropeanUnion": false
}
```

# Limitations

* Just a demo - the data I am seeding might not stay online forever
* IPv4 only right now
* English only
* Dat key for database is hardcoded
* No library yet
* Data is stored as JSON - it would be better to store it in a binary format
* The lookup strategy is quite naive and not heavily tested. A high performance
  version would probably build a custom index
* Uses the free GeoLite2 database. I haven't tried loading the paid GeoIP2
  database (it probably would work, but take care to keep the key private to
  avoid violating license terms)

# License

This software is MIT licensed.

The data that gets loaded into it from MaxMind has this license:

```
This product includes GeoLite2 data created by MaxMind, available from
<a href="http://www.maxmind.com">http://www.maxmind.com</a>.
```
