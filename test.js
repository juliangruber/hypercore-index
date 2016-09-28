'use strict'

var hypercore = require('hypercore')
var level = require('memdb')
var fs = require('fs')
var index = require('./')
var test = require('tap').test

test('index', function (t) {
  t.plan(3)

  var core = hypercore(level())
  var feed = core.createFeed()

  fs.createReadStream(__filename)
  .pipe(feed.createWriteStream())
  .on('finish', function () {
    index(feed, {
      live: false
    }, function (entry, cb) {
      t.ok(entry)
      cb()
    }, function (err) {
      t.error(err)
      index(feed, {
        live: false
      }, function (entry, cb) {
        t.fail('Did not resume')
      }, function (err) {
        t.error(err)
      })
    })
  })
})

test('live', function (t) {
  t.plan(2)

  var core = hypercore(level())
  var feed = core.createFeed()

  index(feed, function (entry, cb) {
    t.ok(entry)
    cb()
  }, function (err) {
    t.error(err)
    t.fail()
  })

  feed.append('foo')
  feed.append('bar')
})
