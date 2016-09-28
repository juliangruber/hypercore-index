'use strict'

const each = require('stream-each')

const noop = () => {}

module.exports = (feed, opts, onentry, ondone) => {
  if (typeof opts === 'function') {
    ondone = onentry
    onentry = opts
    opts = {}
  }
  ondone = ondone || noop
  const key = opts.key || feed.key

  if (typeof opts.start !== 'undefined') {
    onstart(opts.start)
  } else {
    feed._db.get(key, (err, value) => {
      if (err && !err.notFound) return ondone(err)
      if (err && err.notFound) return onstart(0)
      onstart(Number(value))
    })
  }

  const onstart = (start) => {
    let offset = start
    const rs = feed.createReadStream({
      start: start,
      end: opts.end,
      live: typeof opts.live !== 'undefined'
        ? opts.live
        : typeof end === 'undefined'
    })
    each(rs, (buf, done) => {
      onentry(buf, err => {
        if (err) return done(err)
        feed._db.put(key, ++offset, done)
      })
    }, ondone)
  }
}
