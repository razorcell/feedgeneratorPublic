export interface FingerPrintDetectionWebsiteResponse {
  num_fingerprints: number
  sha3_384: string
  tls_fp: TLSFP
}

export interface TLSFP {
  ciphers: string
  client_hello_version: string
  ec_point_formats: string
  extensions: string
  record_version: string
  signature_algorithms: string
  supported_groups: string
}

export interface FingerPrintAPIResponse {
  method: string
  clientIp: string
  countryCode: string
  bodyLength: number
  headers: Headers
}

export interface Headers {
  xForwardedFor: string
  xForwardedProto: string
  xForwardedPort: string
  host: string
  userAgent: string
  accept: string
  acceptLanguage: string
  acceptEncoding: string
  upgradeInsecureRequests: string
  secFetchDest: string
  secFetchMode: string
  secFetchSite: string
  secFetchUser: string
  secGpc: string
  cookie: string
}
