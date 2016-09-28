'use strict'

var hypercore = require('hypercore')
var level = require('memdb')
var fs = require('fs')
var index = require('./')

var core = hypercore(level('/tmp/hypercore-index'))
var feed = core.createFeed()

fs.createReadStream(__filename)
.pipe(feed.createWriteStream())
.on('finish', function () {
  test(test)
})

var test = function (next) {
  console.log('INDEX')
  index(feed, {
    live: false
  }, function (entry, cb) {
    console.log('entry', entry.toString())
    cb()
  }, function (err) {
    if (err) throw err
    console.log('Done!')
    if (next) next()
  })
}
