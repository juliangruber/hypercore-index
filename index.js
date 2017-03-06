'use strict'

var each = require('stream-each')
var rafify = require('rafify')

var noop = function () {}

module.exports = function (storage, opts, onentry, ondone) {
  storage = rafify(storage)
  var feed = opts.feed
  var pending = []
  var offset = 0
  ondone = ondone || noop

  if (typeof opts.start !== 'undefined') {
    onstart(opts.start)
  } else {
    storage.open(function (err) {
      if (err) return ondone(err)

      storage.read(0, storage.length, function (err, buf) {
        if (err) return ondone(err)
        onstart(Number(buf.toString()))
      })
    })
  }

  return append

  function append (data, cb) {
    if (!cb) cb = noop
    feed.append(data, function (err) {
      if (err) return cb(err)
      if (offset >= feed.blocks) return cb(null)
      offset = feed.blocks || feed.length // hypercore V4/V5
      pending.push({ offset: offset, callback: cb })
    })
  }

  function onstart (start) {
    offset = start

    var rs = feed.createReadStream({
      start: start,
      end: opts.end,
      live: typeof opts.live !== 'undefined'
        ? opts.live
        : typeof end === 'undefined'
    })
    each(
      rs,
      function (buf, done) {
        onentry(buf, function (err) {
          if (err) return done(err)
          ++offset
          while (pending.length && offset >= pending[0].offset) {
            pending.shift().callback(null)
          }
          storage.write(0, Buffer(String(offset)), done)
        })
      },
      ondone
    )
  }
}
