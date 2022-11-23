import initCycleTLS, { CycleTLSClient } from 'cycletls'
import { typeOf } from '../../../src/services/tools'

// const firefox1 = {"digest": "a38bd4296e8d53d731224aaf904bfb3a", "ja3": "772,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-51-57-47-53-10,0-23-65281-10-11-35-16-5-51-43-13-45-28,29-23-24-25-256-257,0", "tls": {"ciphers": ["TLS_AES_128_GCM_SHA256", "TLS_CHACHA20_POLY1305_SHA256", "TLS_AES_256_GCM_SHA384", "TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256", "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256", "TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256", "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256", "TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384", "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384", "TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA", …], "curves": ["TLS_GREASE (0xDADA)", "X25519 (29)", "secp256r1 (23)", "secp384r1 (24)", "secp521r1 (25)", "ffdhe2048 (256)", "ffdhe3072 (257)"], "extensions": ["server_name (0) (IANA)", "extended_master_secret (23) (IANA)", "extensionRenegotiationInfo (boringssl) (65281) (IANA)", "supported_groups (10) (IANA)", "ec_point_formats (11) (IANA)", "session_ticket (35) (IANA)", "application_layer_protocol_negotiation (16) (IANA)", "status_request (5) (IANA)", "key_share (51) (IANA)", "supported_versions (43) (IANA)", …], "handshake_duration": "197.558282ms", "is_session_resumption": false, "points": ["0"], "protocols": ["h2", "http/1.1"], "session_ticket": "", "session_ticket_supported": true, "support_secure_renegotiation": true, "version": "0x304 - TLS 1.3", "versions": ["0x6a6a - GREASE Reserved (27242)", "0x304 - TLS 1.3", "0x303 - TLS 1.2", "0x302 - TLS 1.1", "0x301 - TLS 1.0"]}, Symbol(nodejs.util.inspect.custom): [Function anonymous]}'

const myFirefox = {
  digest: 'b7d88ba6146f87cdcd438b6b8190109f',
  ja3: '772,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-16-5-34-51-43-13-45-28-41,29-23-24-25-256-257,0',
  tls: {
    version: '0x304 - TLS 1.3',
    ciphers: [
      'TLS_AES_128_GCM_SHA256',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_256_GCM_SHA384',
      'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
      'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
      'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
      'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
      'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
      'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
      'TLS_RSA_WITH_AES_128_GCM_SHA256',
      'TLS_RSA_WITH_AES_256_GCM_SHA384',
      'TLS_RSA_WITH_AES_128_CBC_SHA',
      'TLS_RSA_WITH_AES_256_CBC_SHA',
    ],
    curves: [
      'X25519 (29)',
      'secp256r1 (23)',
      'secp384r1 (24)',
      'secp521r1 (25)',
      'ffdhe2048 (256)',
      'ffdhe3072 (257)',
    ],
    extensions: [
      'server_name (0) (IANA)',
      'extended_master_secret (23) (IANA)',
      'extensionRenegotiationInfo (boringssl) (65281) (IANA)',
      'supported_groups (10) (IANA)',
      'ec_point_formats (11) (IANA)',
      'application_layer_protocol_negotiation (16) (IANA)',
      'status_request (5) (IANA)',
      'delegated_credentials (34) (IANA)',
      'key_share (51) (IANA)',
      'supported_versions (43) (IANA)',
      'signature_algorithms (13) (IANA)',
      'psk_key_exchange_modes (45) (IANA)',
      'record_size_limit (28) (IANA)',
      'pre_shared_key (41) (IANA)',
    ],
    points: ['0'],
    protocols: ['h2', 'http/1.1'],
    versions: ['0x304 - TLS 1.3', '0x303 - TLS 1.2'],
    handshake_duration: '178.341612ms',
    is_session_resumption: true,
    session_ticket:
      'Ek8SB5ILey0pnkSVfHwg9ChZIOqnVfPkT85oZ/wRfJ3M2ltB3JrBsiIDk+SjEPibgi7EGX/ajGrr12M7o2VlMQ==',
    session_ticket_supported: false,
    support_secure_renegotiation: true,
  },
}

const cycleTLSBrowser = {
  digest: 'a38bd4296e8d53d731224aaf904bfb3a',
  ja3: '772,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-51-57-47-53-10,0-23-65281-10-11-35-16-5-51-43-13-45-28,29-23-24-25-256-257,0',
  tls: {
    version: '0x304 - TLS 1.3',
    ciphers: [
      'TLS_AES_128_GCM_SHA256',
      'TLS_CHACHA20_POLY1305_SHA256',
      'TLS_AES_256_GCM_SHA384',
      'TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256',
      'TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256',
      'TLS_ECDHE_ECDSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256',
      'TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384',
      'TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384',
      'TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA',
      'TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA',
      'TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA',
      'TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA',
      'TLS_DHE_RSA_WITH_AES_128_CBC_SHA',
      'TLS_DHE_RSA_WITH_AES_256_CBC_SHA',
      'TLS_RSA_WITH_AES_128_CBC_SHA',
      'TLS_RSA_WITH_AES_256_CBC_SHA',
      'TLS_RSA_WITH_3DES_EDE_CBC_SHA',
    ],
    curves: [
      //   'TLS_GREASE (0xCACA)',
      'X25519 (29)',
      'secp256r1 (23)',
      'secp384r1 (24)',
      'secp521r1 (25)',
      'ffdhe2048 (256)',
      'ffdhe3072 (257)',
    ],
    extensions: [
      'server_name (0) (IANA)',
      'extended_master_secret (23) (IANA)',
      'extensionRenegotiationInfo (boringssl) (65281) (IANA)',
      'supported_groups (10) (IANA)',
      'ec_point_formats (11) (IANA)',
      'session_ticket (35) (IANA)',
      'application_layer_protocol_negotiation (16) (IANA)',
      'status_request (5) (IANA)',
      'key_share (51) (IANA)',
      'supported_versions (43) (IANA)',
      'signature_algorithms (13) (IANA)',
      'psk_key_exchange_modes (45) (IANA)',
      'record_size_limit (28) (IANA)',
      'padding (21) (IANA)',
    ],
    points: ['0'],
    protocols: ['h2', 'http/1.1'],
    versions: [
      //   '0x4a4a - GREASE Reserved (19018)',
      '0x304 - TLS 1.3',
      '0x303 - TLS 1.2',
      '0x302 - TLS 1.1',
      '0x301 - TLS 1.0',
    ],
    // handshake_duration: '209.337015ms',
    is_session_resumption: false,
    session_ticket: '',
    session_ticket_supported: true,
    support_secure_renegotiation: true,
  },
}

const myJA3 =
  '772,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-16-5-34-51-43-13-45-28-41,29-23-24-25-256-257,0'

const cycleTLSJA3 =
  '771,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-51-57-47-53-10,0-23-65281-10-11-35-16-5-51-43-13-45-28-21,29-23-24-25-256-257,0'
const cycleTLSUA = 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0'

let cycleTLS: CycleTLSClient

beforeAll(async () => {
  cycleTLS = await initCycleTLS()
})

describe('CycleTLS', () => {
  it('Should correctly find Firefox fingerprint', async () => {
    // Send request
    const response = await cycleTLS(
      'https://tools.scrapfly.io/api/fp/ja3?extended=1',
      {
        // body: '',
        ja3: cycleTLSJA3,
        // ja3: '772,4865-4867-4866-49195-49199-52393-52392-49196-49200-49162-49161-49171-49172-156-157-47-53,0-23-65281-10-11-16-5-34-51-43-13-45-28-41,29-23-24-25-256-257,0',
        // userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
        headers: {
          //   'User-Agent':
          //     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:106.0) Gecko/20100101 Firefox/106.0',
          //   Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-User': '?1',
          'Sec-GPC': '1',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        },
        userAgent: 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:87.0) Gecko/20100101 Firefox/87.0',
        // proxy:
        //   'http://khalifa:%25s67mFe2%219is4r%2ABCytcK%24pT%2A%25%26hE@ec2-18-218-229-116.us-east-2.compute.amazonaws.com:4000',
      },
      'get'
    )

    console.log(response.body)
    console.log(typeOf(response.body))

    // Cleanly exit CycleTLS
    // cycleTLS.exit()
    expect(response.status).toEqual(200)
    expect(response.body).toContainEntries([['digest', 'a38bd4296e8d53d731224aaf904bfb3a']])
  }, 10000)

  it('Should correctly find Chrome fingerprint', async () => {
    const ja3 =
      '771,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-17513,29-23-24,0'
    const UA =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36'

    const chromeJA3 =
      '772,4865-4866-4867-49195-49199-49196-49200-52393-52392-49171-49172-156-157-47-53,0-23-65281-10-11-35-16-5-13-18-51-45-43-27-21,29-23-24'
    const chromeJA3Hash = 'A4453E0AF3065ED031E32A5B6851BCD5'

    const chromeAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:106.0) Gecko/20100101 Firefox/106.0'

    // const cycleTLS = await initCycleTLS()
    // Send request
    const response = await cycleTLS(
      'https://tls.browserleaks.com/json',
      {
        // body: '',
        ja3: cycleTLSJA3,
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Upgrade-Insecure-Requests': '1',
          'Sec-Fetch-Dest': 'document',
          'Sec-Fetch-Mode': 'navigate',
          'Sec-Fetch-Site': 'same-site',
          'Sec-Fetch-User': '?1',
          'Sec-GPC': '1',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        },
        userAgent: cycleTLSUA,
        // proxy:
        //   'http://khalifa:%25s67mFe2%219is4r%2ABCytcK%24pT%2A%25%26hE@ec2-18-218-229-116.us-east-2.compute.amazonaws.com:4000',
      },
      'get'
    )

    console.log(response.body)
    expect(response.status).toEqual(200)
    expect(response.body).toContainEntries([['ja3_text', ja3]])
  }, 10000)
})

afterAll(async () => {
  await cycleTLS.exit()
})
