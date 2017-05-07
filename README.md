
# travis-log-stream

Read streaming travis logs, no matter if live or historic.

## Usage

```js
const logStream = require('travis-log-stream')

logStream({
  jobId: process.argv[2] || '229631523',
  appKey: '5df8ac576dcccf4fd076'
}).pipe(process.stdout)
```

## License

MIT
