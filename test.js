'use strict'

var hypercore = require('hypercore')
var ram = require('random-access-memory')
var fs = require('fs')
var index = require('./')
var test = require('tap').test

test('index', function (t) {
  t.plan(3)

  var feed = hypercore(ram)
  var storage = ram()

  fs
    .createReadStream(__filename)
    .pipe(feed.createWriteStream())
    .on('finish', function () {
      index(
        storage,
        {
          feed: feed,
          live: false
        },
        function (entry, cb) {
          t.ok(entry)
          cb()
        },
        function (err) {
          t.error(err)
          index(
            storage,
            {
              feed: feed,
              live: false
            },
            function (entry, cb) {
              t.fail('Did not resume')
            },
            function (err) {
              t.error(err)
            }
          )
        }
      )
    })
})

test('live', function (t) {
  t.plan(2)

  var storage = ram()
  var feed = hypercore(ram)

  index(
    storage,
    {
      feed: feed
    },
    function (entry, cb) {
      t.ok(entry)
      cb()
    },
    function (err) {
      t.error(err)
      t.fail()
    }
  )

  feed.append('foo')
  feed.append('bar')
})

test('start', function (t) {
  var storage = ram()
  var feed = hypercore(ram)

  feed.append('foo', function (err) {
    t.error(err)
    feed.append('bar', function (err) {
      t.error(err)

      index(
        storage,
        {
          feed: feed,
          live: false,
          start: 1
        },
        function (entry, cb) {
          t.equal(entry.toString(), 'bar')
          cb()
        },
        function (err) {
          t.error(err)
          t.end()
        }
      )
    })
  })
})

test('end', function (t) {
  t.plan(4)

  var storage = ram()
  var feed = hypercore(ram)

  feed.append('foo', function (err) {
    t.error(err)
    feed.append('bar', function (err) {
      t.error(err)

      index(
        storage,
        {
          feed: feed,
          live: false,
          end: 1
        },
        function (entry, cb) {
          t.equal(entry.toString(), 'foo')
          cb()
        },
        function (err) {
          t.error(err)
        }
      )
    })
  })
})

test('append', function (t) {
  t.plan(3)

  var storage = ram()
  var feed = hypercore(ram)
  var indexed = null

  var append = index(
    storage,
    {
      feed: feed
    },
    function (entry, cb) {
      t.ok(entry)
      setTimeout(
        function () {
          indexed = entry
          cb()
        },
        100
      )
    }
  )

  append(new Buffer('hello'), function (err) {
    t.error(err)
    t.same(indexed, new Buffer('hello'), 'callback after index')
  })
})

test('append twice', function (t) {
  var storage = ram()
  var feed = hypercore(ram)
  var indexed = null

  var append = index(
    storage,
    {
      feed: feed
    },
    function (entry, cb) {
      setTimeout(
        function () {
          indexed = entry
          cb()
        },
        100
      )
    }
  )

  append(new Buffer('hello'), function (err) {
    t.error(err)
    t.equal(indexed.toString(), 'hello', 'callback after index')

    append(new Buffer('world'), function (err) {
      t.error(err)
      t.equal(indexed.toString(), 'world', 'callback after index')
      t.end()
    })
  })
})
