'use strict'

var each = require('stream-each')

var noop = function () {}

module.exports = function (feed, opts, onentry, ondone) {
  if (typeof opts === 'function') {
    ondone = onentry
    onentry = opts
    opts = {}
  }
  ondone = ondone || noop
  var key = '!index!' + feed.key.toString('hex') + '!' + (opts.key || 'default')

  if (typeof opts.start !== 'undefined') {
    onstart(opts.start)
  } else {
    feed._db.get(key, function (err, value) {
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
        feed._db.put(key, ++offset, done)
      })
    }, ondone)
  }
}
