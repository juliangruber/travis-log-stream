
# travis-log-stream

Read streaming travis logs, no matter if live or historic.

This will read a job's log from the travis API first, and then if it's still running also continues streaming live log output via the Pusher endpoint.

## Usage

```js
const logStream = require('travis-log-stream')

logStream({
  jobId: process.argv[2] || '229631523',
  appKey: '5df8ac576dcccf4fd076'
}).pipe(process.stdout)
```

## Related projects

- __[travis-logs](https://github.com/juliangruber/travis-logs)__ &mdash; Stream live travis logs of the current commit to your terminal

## License

MIT
