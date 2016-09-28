'use strict'

var each = require('stream-each')

var noop = function () {}

module.exports = function (opts, onentry, ondone) {
  var feed = opts.feed
  var db = opts.db
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

  function onstart (start) {
    var offset = start
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
        db.put('_seq', ++offset, done)
      })
    }, ondone)
  }
}
