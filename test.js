'use strict'

var hypercore = require('hypercore')
var level = require('memdb')
var fs = require('fs')
var index = require('./')
var test = require('tap').test

test('index', function (t) {
  t.plan(3)

  var db = level()
  var core = hypercore(db)
  var feed = core.createFeed()

  fs.createReadStream(__filename)
  .pipe(feed.createWriteStream())
  .on('finish', function () {
    index({
      feed: feed,
      db: db,
      live: false
    }, function (entry, cb) {
      t.ok(entry)
      cb()
    }, function (err) {
      t.error(err)
      index({
        feed: feed,
        db: db,
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

  var db = level()
  var core = hypercore(db)
  var feed = core.createFeed()

  index({
    feed: feed,
    db: db
  }, function (entry, cb) {
    t.ok(entry)
    cb()
  }, function (err) {
    t.error(err)
    t.fail()
  })

  feed.append('foo')
  feed.append('bar')
})

test('start', function (t) {
  var db = level()
  var core = hypercore(db)
  var feed = core.createFeed()

  feed.append('foo', function (err) {
    t.error(err)
    feed.append('bar', function (err) {
      t.error(err)

      index({
        feed: feed,
        db: db,
        live: false,
        start: 1
      }, function (entry, cb) {
        t.equal(entry.toString(), 'bar')
        cb()
      }, function (err) {
        t.error(err)
        t.end()
      })
    })
  })
})

test('end', function (t) {
  t.plan(4)

  var db = level()
  var core = hypercore(db)
  var feed = core.createFeed()

  feed.append('foo', function (err) {
    t.error(err)
    feed.append('bar', function (err) {
      t.error(err)

      index({
        feed: feed,
        db: db,
        live: false,
        end: 1
      }, function (entry, cb) {
        t.equal(entry.toString(), 'foo')
        cb()
      }, function (err) {
        t.error(err)
      })
    })
  })
})