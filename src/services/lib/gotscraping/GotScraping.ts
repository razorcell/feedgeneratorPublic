import process from 'process'
import moment from 'moment'
import { gotScraping, OptionsInit } from 'got-scraping'
import { HeaderGenerator } from 'header-generator'
import type { Response } from 'got-cjs/dist/source/core/response.js'

import filemodule from '../../file'
import { catchError, lg, pleaseWait } from '../../tools'
import { gotRetryDefaults } from './GotScraping.consts'

const defaultSourceConfig = {
  tor_max_download_trials: 1,
  tor_timeout: 60000,
  enable_download_log: true,
  enable_general_log: true,
  delay_min: 2,
  delay_max: 3,
  use_tor: 0,
  use_public_proxy: 0,
  use_awsproxy: 0,
  use_ediagadir_proxy: 0,
  defheaders: {},
  sendFileEmails: 0,
  sendFileEmailsToAddress: 'ediagadir.systems@gmail.com',
}

const defaultParams = {
  source: 'general',
  savetofile: false,
  id: '',
  logReq: false,
}

type ResponseValidator = (body: string, response: Response) => boolean | Promise<boolean>

export type GotScrapingParams = {
  url?: string
  source?: string
  savetofile?: boolean
  id?: string
  logReq?: boolean
  acceptedStatusCodes?: number[] | undefined
  acceptedLength?: number | undefined
  callback?: ResponseValidator
}

export async function down<T>(
  url: string,
  params: GotScrapingParams,
  sourceConfig: sourceConfig,
  logTab = 1,
  gotOptions: OptionsInit = {}
): Promise<Response<T>> {
  const thisSourceConfig = { ...defaultSourceConfig, ...sourceConfig }
  const thisParams = { ...defaultParams, ...params }
  const callback = thisParams
  thisParams.url = url
  let trials = 0
  const max_trials = thisSourceConfig.tor_max_download_trials
  const delayMin = thisSourceConfig.delay_min
  const delayMax = thisSourceConfig.delay_max
  let download_success = false
  const ID = thisParams.id

  while (!download_success && trials < max_trials) {
    try {
      trials++
      gotOptions.proxyUrl = setupProxyAgentWithProxyUrl(sourceConfig)
      gotOptions.headers = prepareHeaders(gotOptions)
      gotOptions.retry = prepareRetry(thisParams)
      console.debug('gotHeaders', gotOptions.headers)
      let gateway = 'No PROXY'
      let logType = 'info'
      if (thisSourceConfig.use_tor) gateway = 'use_tor'
      if (thisSourceConfig.use_awsproxy) gateway = 'AWS'
      if (thisSourceConfig.use_public_proxy) gateway = 'PUBLIC PXY'
      if (thisSourceConfig.use_ediagadir_proxy) gateway = 'AGADIR PXY'
      if (trials < 10) {
        logTrial(ID, thisParams, gateway, trials, logType, logTab)
      } else {
        logType = 'warn'
        logTrial(ID, thisParams, gateway, trials, logType, logTab)
      }
      const start = Date.now()

      const response = (await gotScraping(url, gotOptions)) as Response<T>
      if (thisParams.logReq)
        lg({ requestHeaders: response.request.options.headers }, logTab + 1, 'info', thisParams.source)
      const time = Math.floor((Date.now() - start) / 1000)
      if (response.statusCode !== 200) {
        logError(ID, thisParams, response, logTab + 1, time)
        if (thisParams.savetofile) {
          filemodule.writeToFile(
            `downloads/${moment().format('YYYYMMDD')}-${thisParams.source}-ERROR-${makeId(10)}.html`,
            response.rawBody
          )
        }
        await pleaseWait(delayMin, delayMax, logTab + 1, thisParams.source)
      } else {
        logSuccess(ID, thisParams, response, logTab + 1, time)
        download_success = true
        if (thisParams.savetofile) {
          await filemodule.writeToFile(
            `downloads/${moment().format('YYYYMMDD')}-${thisParams.source}-${makeId(10)}.html`,
            response.rawBody
          )
        }
        return response
      }
    } catch (err) {
      // console.error(err)
      catchError(
        err,
        `[${thisParams.source}][${thisParams.id}]`,
        true,
        'error',
        logTab + 1,
        thisParams.source
      )
      await pleaseWait(delayMin, delayMax, logTab + 1, thisParams.source)
    }
  }
  try {
    if (!download_success) {
      lg(`ID[${ID}] Trials exceeded ${max_trials} URL[${url}]`, logTab + 1, 'error', thisParams.source)
      throw new Error(`ID[${ID}] Trials exceeded ${max_trials} URL[${url}]`)
    }
  } catch (err) {
    catchError(err, `[${thisParams.source}][${thisParams.id}]`, true, 'error', logTab + 1, thisParams.source)
    return
  }
}

// export function prepareHooks(params: GotScrapingParams): OptionsInit['retry'] {
//   if (params.acceptedStatusCodes) {
//     const thisRetry = gotRetryDefaults
//     thisRetry.statusCodes = thisRetry.statusCodes.filter(code => !params.acceptedStatusCodes.includes(code))

//     return thisRetry
//   }

//   return gotRetryDefaults
// }

export function prepareRetry(params: GotScrapingParams): OptionsInit['retry'] {
  if (params.acceptedStatusCodes) {
    const thisRetry = gotRetryDefaults
    thisRetry.statusCodes = thisRetry.statusCodes.filter(code => !params.acceptedStatusCodes.includes(code))

    return thisRetry
  }

  return gotRetryDefaults
}

export function prepareHeaders(gotOptions?: OptionsInit): Record<string, string | string[]> {
  const browserHeaders = new HeaderGenerator(gotOptions?.headerGeneratorOptions).getHeaders()
  if (gotOptions?.headers) return { ...browserHeaders, ...gotOptions?.headers }
  else return browserHeaders
}

function setupProxyAgentWithProxyUrl(sourceConfig: sourceConfig): string | undefined {
  if (sourceConfig.use_tor) return `socks5://${process.env.TOR_ADDRESS}:${process.env.TOR_PORT}`
  if (sourceConfig.use_awsproxy)
    return `http://${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS || ''}@${
      process.env.AWS_HTTP_PROXY
    }`
  if (sourceConfig.use_ediagadir_proxy)
    return `http://${process.env.EDIAGADIR_HTTP_PROXY_USER}:${process.env.EDIAGADIR_HTTP_PROXY_PASS || ''}@${
      process.env.EDIAGADIR_HTTP_PROXY
    }`
}

export function makeId(length): string {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

function logTrial(ID, params, gateway, trials, logType, logTab): void {
  lg(`<b>Trial:${trials}</b> ID[${ID}] =>${gateway}=> Url=${params.url}`, logTab + 1, logType, params.source)
}

function logSuccess(ID, params, response, logTab = 1, time): void {
  lg(
    `ID[${ID}] DOWN SUCCESS: code=${response.status} in <b>${time} sec</b>`,
    logTab + 1,
    'verbose',
    params.source
  )
}

function logError(ID, params, response, logTab = 1, time): void {
  lg(
    `ID[${ID}] DOWN ERROR: code=${response.status} in <b>${time} sec</b> | Text: ${response.statusText}`,
    logTab + 1,
    'error',
    params.source
  )
}

// function setupProxyAgentUsingAgentProperty(sourceConfig: sourceConfig) {
//   if (sourceConfig.use_tor) {
//     const agent = {
//       /* Setting up a proxy agent for the http protocol. */
//       // http: new SocksProxyAgent(`socks5://${process.env.TOR_ADDRESS}:${process.env.TOR_PORT}`),
//       // https: new SocksProxyAgent(`socks5://${process.env.TOR_ADDRESS}:${process.env.TOR_PORT}`),
//       https: new ProxyAgent(`socks5://${process.env.TOR_ADDRESS}:${process.env.TOR_PORT}`),
//       // http2: undefined,
//     }
//     console.log(agent)
//     return agent
//   }

//   let optionsHttp: HttpProxyAgentOptions
//   let optionsHttps: HttpsProxyAgentOptions

//   if (sourceConfig.use_awsproxy) {
//     const authHeader = `Basic ${Buffer.from(
//       `${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS}`
//     ).toString('base64')}`

//     // console.debug('authHeader', authHeader)
//     optionsHttp = {
//       // keepAlive: true,
//       // keepAliveMsecs: 1000,
//       // maxSockets: 50,
//       // maxFreeSockets: 50,
//       // proxy: `http://${process.env.AWS_HTTP_PROXY}`,
//       proxy: `http://${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS}---@${process.env.AWS_HTTP_PROXY}`,
//       // proxyRequestOptions: {
//       //   headers: {
//       //     'Proxy-Authorization': authHeader,
//       //   },
//       // },
//     }
//     optionsHttps = {
//       // keepAlive: true,
//       // keepAliveMsecs: 1000,
//       // maxSockets: 50,
//       // maxFreeSockets: 50,
//       proxy: `https://${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS}--@${process.env.AWS_HTTP_PROXY}`,
//       // port: parseInt(`${process.env.AWS_HTTP_PROXY_PORT}`),
//       // proxyRequestOptions: {
//       //   headers: {
//       //     'Proxy-Authentication':
//       //       'Basic ' +
//       //       new Buffer(`${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS}`).toString(
//       //         'base64'
//       //       ),
//       //   },
//       // },
//     }

//     // var proxyOpts = url.parse('https://your-proxy.com')
//     // var proxyOpts = url.parse(`${process.env.AWS_HTTP_PROXY}`)
//     // // proxyOpts.auth = 'username:password'
//     // proxyOpts.auth = `${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS}`
//     // var proxy = new HttpsProxyAgent(proxyOpts)
//     const http = new HttpProxyAgent(optionsHttp)
//     const https = new HttpsProxyAgent(optionsHttps)

//     const agent = {
//       http,
//       // http: new HttpsProxyAgent(
//       //   `http://${process.env.AWS_HTTP_PROXY_USER}:${process.env.AWS_HTTP_PROXY_PASS}@${process.env.AWS_HTTP_PROXY}`
//       // ),
//       https,
//       http2: new Http2Agent(optionsHttps),
//     }

//     // console.log(agent)
//     return agent
//   }
//   if (sourceConfig.use_ediagadir_proxy) {
//     optionsHttp = {
//       keepAlive: true,
//       keepAliveMsecs: 1000,
//       maxSockets: 50,
//       maxFreeSockets: 50,
//       proxy: `http://${process.env.EDIAGADIR_HTTP_PROXY}`,
//       proxyRequestOptions: {
//         headers: {
//           'Proxy-Authentication':
//             'Basic ' +
//             new Buffer(
//               `${process.env.EDIAGADIR_HTTP_PROXY_USER}:${process.env.EDIAGADIR_HTTP_PROXY_PASS}`
//             ).toString('base64'),
//         },
//       },
//     }
//     optionsHttps = {
//       keepAlive: true,
//       keepAliveMsecs: 1000,
//       maxSockets: 50,
//       maxFreeSockets: 50,
//       proxy: `http://${process.env.EDIAGADIR_HTTP_PROXY}`,
//       proxyRequestOptions: {
//         headers: {
//           'Proxy-Authentication':
//             'Basic ' +
//             new Buffer(
//               `${process.env.EDIAGADIR_HTTP_PROXY_USER}:${process.env.EDIAGADIR_HTTP_PROXY_PASS}`
//             ).toString('base64'),
//         },
//       },
//     }

//     // return new HttpProxyAgent(options)
//     const agent = {
//       http: new HttpProxyAgent(optionsHttp),
//       https: new HttpsProxyAgent(optionsHttps),
//       /* Not doing anything. */
//       // http2: new Http2Agent(optionsHttps),
//     }

//     console.log(agent)
//     return agent
//   }

//   return {}
// }
