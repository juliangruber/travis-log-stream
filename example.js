const logStream = require('.')

logStream({
  jobId: process.argv[2] || '229631523',
  appKey: '5df8ac576dcccf4fd076'
}).pipe(process.stdout)
