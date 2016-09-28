'use strict'

const hypercore = require('hypercore')
const level = require('memdb')
const fs = require('fs')
const index = require('.')

const core = hypercore(level('/tmp/hypercore-index'))
const feed = core.createFeed()

fs.createReadStream(__filename)
.pipe(feed.createWriteStream())
.on('finish', () => {
  test(() => test())
})

const test = next => {
  console.log('INDEX')
  index(feed, {
    live: false
  }, (entry, cb) => {
    console.log('entry', entry.toString())
    cb()
  }, err => {
    if (err) throw err
    console.log('Done!')
    if (next) next()
  })
}
