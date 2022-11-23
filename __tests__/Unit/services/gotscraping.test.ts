/* eslint-disable @typescript-eslint/no-var-requires */
import { gotScraping, OptionsInit, RequestError } from 'got-scraping'
import { HeaderGenerator } from 'header-generator'
const { PRESETS } = require('header-generator')

import {
  down,
  GotScrapingParams,
  makeId,
  prepareRetry,
} from '../../../src/services/lib/gotscraping/GotScraping'
import type { Response } from '../../../node_modules/got-cjs/dist/source/core/response.js'
import { FingerPrintAPIResponse, FingerPrintDetectionWebsiteResponse } from './types'

beforeAll(() => {
  require('dotenv-safe').config({
    allowEmptyValues: true,
    example: __dirname + '/../../../.env',
  })
})

describe('got-scraping', () => {
  it('Should generate correct fingerprint using PRESETS', async () => {
    // const headerGenerator =
    const options: OptionsInit = {
      url: 'https://tls.incolumitas.com/fps',
      headerGeneratorOptions: PRESETS.MODERN_MACOS_CHROME,
      responseType: 'json',
    }

    const response = (await gotScraping(options)) as Response
    const { body, statusCode } = response
    console.debug(statusCode)
    console.debug(body)

    expect((body as FingerPrintDetectionWebsiteResponse)['user-agent']).toEqual(
      expect.stringContaining('Mac OS')
    )
    expect((body as FingerPrintDetectionWebsiteResponse)['user-agent']).toEqual(
      expect.stringContaining('Chrome')
    )
  }, 10000)

  it('Should successfully process a POST request', async () => {
    // const headerGenerator =

    const sourceConfig = {
      use_tor: 0,
      use_public_proxy: 0,
      use_awsproxy: 0,
      use_ediagadir_proxy: 0,
    }

    const params: GotScrapingParams = {
      id: 'Should successfully process a POST request',
      logReq: true,
    }

    const url = `http://www.nasdaqomxnordic.com/webproxy/DataFeedProxy.aspx`
    const dataString = `xmlquery=%3Cpost%3E%0A%3Cparam+name%3D%22Exchange%22+value%3D%22NMF%22%2F%3E%0A%3Cparam+name%3D%22SubSystem%22+value%3D%22Prices%22%2F%3E%0A%3Cparam+name%3D%22Action%22+value%3D%22GetMarket%22%2F%3E%0A%3Cparam+name%3D%22inst__a%22+value%3D%220%2C1%2C2%2C5%2C21%2C23%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt%22+value%3D%22%2FnordicV3%2Fpaging_inst_table.xsl%22%2F%3E%0A%3Cparam+name%3D%22Market%22+value%3D%22GITS%3ACO%3ACPHCB%22%2F%3E%0A%3Cparam+name%3D%22RecursiveMarketElement%22+value%3D%22True%22%2F%3E%0A%3Cparam+name%3D%22XPath%22+value%3D%22%2F%2Finst%5B%40itid%3D'2'+or+%40itid%3D'3'%5D%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_lang%22+value%3D%22en%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_tableId%22+value%3D%22bondsSearchDKTable%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_options%22+value%3D%22%2Cnoflag%2C%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_hiddenattrs%22+value%3D%22%2Cfnm%2Cisrid%2Cdlt%2Ctp%2Cbb%2Cib%2Ccpt%2Crps%2Cos%2Clt%2Cst%2Citid%2Clists%2Cit%2C%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_notlabel%22+value%3D%22%2Cfnm%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_jspcbk%22+value%3D%22doPaging%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_jsscbk%22+value%3D%22doSortPager%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_sorder%22+value%3D%22descending%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_sattr%22+value%3D%22chp%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_start%22+value%3D%221%22%2F%3E%0A%3Cparam+name%3D%22ext_xslt_size%22+value%3D%2250%22%2F%3E%0A%3Cparam+name%3D%22inst__an%22+value%3D%22id%2Cnm%2Cfnm%2Cisin%2Ccpnrt%2Cbp%2Cap%2Clsp%2Cchp%2Catap%2Ced%2Cdlt%2Ccr%2Cisrid%2Ctp%2Cbb%2Cib%2Ccpt%2Crps%2Cos%2Clt%2Cst%2Citid%2Clists%2Cit%22%2F%3E%0A%3Cparam+name%3D%22app%22+value%3D%22%2Fobligationer%2Fdanmark%22%2F%3E%0A%3C%2Fpost%3E`
    const goodHeaders = new HeaderGenerator({
      browsers: ['firefox', 'chrome'],
      devices: ['desktop', 'mobile'],
      locales: ['en-US'],
      operatingSystems: ['windows', 'macos', 'linux', 'android', 'ios'],
    }).getHeaders()

    const denmarkCustomHeaders = {
      referer: 'https://www.nasdaqomxnordic.com/bonds/denmark',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      cookie: `JSESSIONID=${makeId('815D11AAC94FE86744BB84C431C63C7'.length)}`,
    }

    const finalHeaders = { ...goodHeaders, ...denmarkCustomHeaders }

    console.debug(finalHeaders)

    const gotOptions: OptionsInit = {
      method: 'post',
      body: dataString,
      headers: finalHeaders,
      timeout: {
        request: 8000,
      },
    }

    const response = await down(url, params, sourceConfig, 1, gotOptions)
    const { body, statusCode } = response
    expect(statusCode).toEqual(200)
    expect(body).toEqual(expect.stringContaining('onClick="javascript:doPaging(-49);">'))
  }, 8000)
  it('Should extract fresh Denmark Cookies', async () => {
    const params: GotScrapingParams = {
      id: 'Should successfully ping US proxy',
      logReq: true,
      // overwriteHeaders: true,
    }

    const sourceConfig = {
      use_tor: 0,
      use_public_proxy: 0,
      use_awsproxy: 0,
      use_ediagadir_proxy: 0,
    }

    const url = `https://www.nasdaqomxnordic.com/bonds/denmark`

    const response = await down<string>(url, params, sourceConfig, 1)

    const { headers } = response
    // console.debug(headers)

    expect(headers['set-cookie']?.shift()).toEqual(expect.stringContaining('JSESSIONID='))
  }, 10000)
  it('Should successfully ping US proxy', async () => {
    const params = {
      id: 'Should successfully ping US proxy',
    }

    const sourceConfig = {
      use_tor: 0,
      use_public_proxy: 0,
      use_awsproxy: 1,
      use_ediagadir_proxy: 0,
    }

    const gotOptions: OptionsInit = {
      responseType: 'json',
    }

    const url = `https://api.apify.com/v2/browser-info`

    const response = await down<FingerPrintAPIResponse>(url, params, sourceConfig, 1, gotOptions)

    const { body } = response
    const { clientIp, countryCode } = body
    expect(clientIp).toEqual('18.218.229.116')
    expect(countryCode).toEqual('US')
  }, 10000)
  it.only('Should throw an error after response', async () => {
    const params = {
      id: 'Should validate response using Hooks',
    }

    const sourceConfig = {
      use_tor: 0,
      use_public_proxy: 0,
      use_awsproxy: 1,
      use_ediagadir_proxy: 0,
    }

    const gotOptions: OptionsInit = {
      responseType: 'json',
      hooks: {
        afterResponse: [
          (response: Response<FingerPrintAPIResponse>, retryWithMergedOptions) => {
            throw new Error('Invalid response')
          },
        ],
        beforeRetry: [
          error => {
            // This will be called on `retryWithMergedOptions(...)`
          },
        ],
      },
    }

    const url = `https://api.apify.com/v2/browser-info`

    expect(await down<FingerPrintAPIResponse>(url, params, sourceConfig, 1, gotOptions)).toThrowError(
      'Invalid response'
    )
  }, 10000)
  it.skip('Should successfully ping ADSL proxy', async () => {
    const params = {
      id: 'Should successfully ping US proxy',
    }

    const sourceConfig = {
      use_tor: 0,
      use_public_proxy: 0,
      use_awsproxy: 0,
      use_ediagadir_proxy: 1,
    }

    const gotOptions: OptionsInit = {
      responseType: 'json',
    }

    const url = `https://api.apify.com/v2/browser-info`

    const response = await down<FingerPrintAPIResponse>(url, params, sourceConfig, 1, gotOptions)

    const { body } = response
    const { clientIp, countryCode } = body
    expect(clientIp).toEqual('18.218.229.116')
    expect(countryCode).toEqual('US')
  }, 10000)

  it('Should generate good headers', async () => {
    // const headers = new HeaderGenerator(PRESETS.MODERN_MACOS_CHROME).getHeaders()
    const headers = new HeaderGenerator({
      browsers: ['firefox', 'chrome'],
      devices: ['desktop'],
      locales: ['en-US'],
      operatingSystems: ['windows', 'linux'],
    }).getHeaders()

    console.debug(headers)
    expect(headers).toBeDefined()
  })
  it('Should should allow certain statusCodes', async () => {
    const params: GotScrapingParams = {
      acceptedStatusCodes: [408, 413, 429],
    }

    const retry = prepareRetry(params)

    expect(retry).toEqual({
      limit: 1,
      methods: ['GET', 'PUT', 'HEAD', 'DELETE', 'OPTIONS', 'TRACE'],
      statusCodes: [500, 502, 503, 504, 521, 522, 524],
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
      calculateDelay: expect.toBeFunction(),
      backoffLimit: Number.POSITIVE_INFINITY,
      noise: 100,
    })
  })
})
