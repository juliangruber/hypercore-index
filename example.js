'use strict'

var hypercore = require('hypercore')
var ram = require('random-access-memory')
var fs = require('fs')
var index = require('./')

var feed = hypercore(ram)

fs
  .createReadStream(__filename)
  .pipe(feed.createWriteStream())
  .on('finish', function () {
    test(test)
  })

var test = function (next) {
  console.log('INDEX')
  index(
    ram(),
    {
      feed: feed,
      live: false
    },
    function (entry, cb) {
      console.log('entry', entry.toString())
      cb()
    },
    function (err) {
      if (err) throw err
      console.log('Done!')
      if (next) next()
    }
  )
}
