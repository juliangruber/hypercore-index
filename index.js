'use strict'

const Writable = require('stream').Writable

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
    rs.on('error', ondone)
    const ws = Writable({
      write (buf, _, done) {
        onentry(buf, err => {
          if (err) return done(err)
          feed._db.put(key, ++offset, done)
        })
      }
    })
    ws.on('error', ondone)
    ws.on('finish', ondone)
    rs.pipe(ws)
  }
}
