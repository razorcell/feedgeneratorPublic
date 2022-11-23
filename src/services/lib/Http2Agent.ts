import http2, { SecureClientSessionOptions } from 'http2-wrapper'

export default class Http2Agent extends http2.Agent {
  async createConnection(origin: URL, options: SecureClientSessionOptions) {
    // console.log(`Connecting to ${http2.Agent.normalizeOrigin(origin)}`)
    return http2.Agent.connect(origin, options)
  }
}

// http2.get(
//   {
//     hostname: 'google.com',
//     agent: new MyAgent(),
//   },
//   response => {
//     response.on('data', chunk => console.log(`Received chunk of ${chunk.length} bytes`))
//   }
// )
