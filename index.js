'use strict'

const pkg = require('./package')
const OrderedEmitter = require('ordered-emitter')
const { Transform } = require('stream')
const Pusher = require('pusher-js')
const readOnly = require('read-only-stream')
const { https } = require('follow-redirects')
const concat = require('concat-stream')
const JSONStream = require('JSONStream')

class FilterMeta extends Transform {
  _transform (chunk, _, done) {
    chunk = chunk
      .split('\n')
      .filter(line => !/^travis_/.test(line.toString()))
      .join('\n')
  }
}

module.exports = ({ jobId, appKey }) => {
  const s = new FilterMeta()
  const ordered = new OrderedEmitter()

  const finish = () => {
    socket.disconnect()
    s.push(null)
  }

  ordered.on('log', msg => {
    s.push(msg._log || msg.content)
    if (msg.final) finish()
  })

  const socket = new Pusher(appKey)
  const channel = socket.subscribe(`job-${jobId}`)
  channel.bind('job:log', msg => {
    ordered.emit('log', Object.assign(msg, { order: msg.number }))
  })

  const reqOpts = {
    host: 'api.travis-ci.org',
    path: `/jobs/${jobId}/log`,
    headers: {
      'user-agent': `github.com/juliangruber/travis-log-stream@${pkg.version}`,
      accept: 'application/json; chunked=true; version=2, text/plain; version=2'
    }
  }
  const req = https.get(reqOpts, res => {
    if (res.headers['content-type'] === 'text/plain') {
      res.pipe(
        concat(body => {
          ordered.emit('log', { order: 0, _log: body, final: true })
        })
      )
    } else {
      res
        .pipe(JSONStream.parse(['log', 'parts', true]))
        .on('error', err => s.emit('error', err))
        .on('data', part => {
          ordered.emit('log', Object.assign(part, { order: part.number }))
        })
    }
  })
  req.on('error', err => s.emit('error', err))

  return readOnly(s)
}
