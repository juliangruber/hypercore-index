
# hypercore-index

[![Greenkeeper badge](https://badges.greenkeeper.io/juliangruber/hypercore-index.svg)](https://greenkeeper.io/)

Linear asynchronous stateful indexing of a
[hypercore](https://github.com/mafintosh/hypercore) feed.

[![build status](https://travis-ci.org/juliangruber/hypercore-index.svg?branch=master)](http://travis-ci.org/juliangruber/hypercore-index)

Traverses a hypercore feed in chronologic order and lets you consume each
entry via some asynchronous function. Remembers where you left inside the
feed's db and continues there on later runs.

## Example

```js
const ram = require('random-access-memory')
const hypercore = require('hypercore')
const index = require('hypercore-index')

const feed = hypercore(ram)

index(ram(), {
  feed: feed
}, function onentry (entry, next) {
  console.log('entry', entry.toString())
  next()
}, function ondone (err) {
  if (err) throw err
  console.log('Done!')
})
```

## Installation

```bash
$ npm install hypercore-index
```

## API

### var append = index(storage, opts, onentry, [ondone])

`storage` is an [abstract-random-access](https://github.com/juliangruber/abstract-random-access) compliant storage or file path.

Options:

- `feed`: The hypercore feed. Required.
- `start`: The first index. Default: `0`
- `end`: The last index. Default: `Infinity`
- `live`: Whether to keep scanning. Default: `true`, unless you pass `opts.end`

If you are the feed owner you can use the `append(data, callback)` method returned to append
data and and wait for it to be indexed

## License

MIT
