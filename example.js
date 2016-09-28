'use strict'

var hypercore = require('hypercore')
var level = require('memdb')
var fs = require('fs')
var index = require('.')

var core = hypercore(level('/tmp/hypercore-index'))
var feed = core.createFeed()

fs.createReadStream(__filename)
.pipe(feed.createWriteStream())
.on('finish', () => {
  test(() => test())
})

var test = next => {
  console.log('INDEX')
  index(feed, {
    live: false
  }, (entry, cb) => {
    console.log('entry', entry.toString())
    cb()
  }, err => {
    if (err) throw err
    console.log('Done!')
    if (next) next()
  })
}
