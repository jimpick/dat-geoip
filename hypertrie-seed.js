const hypercore = require('hypercore')
const hyperdiscovery = require('hyperdiscovery')

const feed = hypercore('./db', {valueEncoding: 'json'})

feed.ready(() => {
  console.log('Key:', feed.key.toString('hex'))
  const sw = hyperdiscovery(feed)
  sw.on('connection', (peer, info) => {
    console.log('Connection:', info.host)
  })
})

