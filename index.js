'use strict'

var each = require('stream-each')

var noop = function () {}

module.exports = function (opts, onentry, ondone) {
  var feed = opts.feed
  var db = opts.db
  var pending = []
  var offset = 0
  ondone = ondone || noop

  if (typeof opts.start !== 'undefined') {
    onstart(opts.start)
  } else {
    db.get('_seq', function (err, value) {
      if (err && !err.notFound) return ondone(err)
      if (err && err.notFound) return onstart(0)
      onstart(Number(value))
    })
  }

  return append

  function append (data, cb) {
    if (!cb) cb = noop
    feed.append(data, function (err) {
      if (err) return cb(err)
      if (offset >= feed.blocks) return cb(null)
      pending.push({offset: feed.blocks, callback: cb})
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
    each(rs, function (buf, done) {
      onentry(buf, function (err) {
        if (err) return done(err)
        ++offset
        while (pending.length && offset >= pending[0].offset) {
          pending.shift().callback(null)
        }
        db.put('_seq', offset, done)
      })
    }, ondone)
  }
}
