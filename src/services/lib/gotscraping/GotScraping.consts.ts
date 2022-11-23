import { OptionsInit } from 'got-scraping'

export const gotRetryDefaults: OptionsInit['retry'] = {
  limit: 1,
  methods: ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
  statusCodes: [408, 413, 429, 500, 502, 503, 504, 521, 522, 524],
  errorCodes: [
    'ETIMEDOUT',
    'ECONNRESET',
    'EADDRINUSE',
    'ECONNREFUSED',
    'EPIPE',
    'ENOTFOUND',
    'ENETUNREACH',
    'EAI_AGAIN',
  ],
  maxRetryAfter: undefined,
  calculateDelay: ({ computedValue }) => computedValue,
  backoffLimit: Number.POSITIVE_INFINITY,
  noise: 100,
}
