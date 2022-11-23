import { lg, catchError, pleaseWait, URLToEllipse, arrayToChunks } from '../tools'
import cheerio from 'cheerio'
import { down } from '../Faxios'
import { getOneTag, getTrsFromPage } from '../scraping'
import _ from 'lodash'

export async function getEuronextETFsUpdates(
  source: string,
  sourceConfig: EuronextETFSourceConfig,
  logTab: number
): Promise<EuronextETF[]> {
  try {
    const etfs = await getAllSecuritiesDetails(
      source,
      await getAllSecurities(source, sourceConfig, logTab + 1),
      sourceConfig,
      1
    )
    return etfs
  } catch (err) {
    catchError(err, 'getEuronextETFsUpdates', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getAllSecurities(
  source: string,
  sourceConfig: EuronextETFSourceConfig,
  logTab: number
): Promise<EuronextETF[] | []> {
  try {
    let allData = new Array()
    let end_reached = false
    let pageId = 0
    while (!end_reached) {
      lg(`Get Euronext ETFs page : ${pageId}`, logTab + 1, 'info', source)
      let this_page_data = await getEuronextEtfListInPage(source, pageId, sourceConfig, logTab + 1)
      allData = allData.concat(this_page_data)
      lg(`[${this_page_data.length}] Securities in this page`, logTab + 1, 'info', source)
      pageId++
      if (this_page_data.length < 1 || pageId >= sourceConfig.maximum_pages) {
        end_reached = true
        lg(`END REACHED`, logTab + 1, 'info', source)
        break
      }
      await pleaseWait(sourceConfig.delay_min, sourceConfig.delay_max, logTab + 2, source)
    }

    return allData
  } catch (err) {
    catchError(err, 'getAllSecurities', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function extractSecuritiesFromTags(
  source: string,
  securities: string[],
  logTab: number
): Promise<EuronextETF[]> {
  try {
    let securitiesJSON = []
    securities.forEach(sec => {
      let security: EuronextETF = {}
      let $ = cheerio.load(sec[0])
      security.isin = sec[1]
      security.label = $('a').text().trim()
      security.symbol = sec[2]
      security.url = URLToEllipse(`https://live.euronext.com${$('a').attr('href')}`)
      $ = cheerio.load(sec[3])
      security.market = $('div').attr('title')
      security.market_symbol = $('div').text().trim()
      securitiesJSON.push(security)
    })
    return securitiesJSON
  } catch (err) {
    catchError(err, 'extractSecuritiesFromTags', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getEuronextEtfListInPage(
  source: string,
  pageId: number,
  sourceConfig: EuronextETFSourceConfig,
  logTab: number
): Promise<EuronextETF[]> {
  try {
    let size = sourceConfig.EtfListSize
    pageId = pageId * size
    let URI = `https://live.euronext.com/en/pd_es/data/track?mics=XAMS%2CXBRU%2CXLIS%2CXPAR%2CXLDN%2CXMSM%2CXOSL`
    // lg({ size, pageId }, logTab + 1, 'info', source)
    const dataString = `draw=6&columns%5B0%5D%5Bdata%5D=0&columns%5B0%5D%5Bname%5D=&columns%5B0%5D%5Bsearchable%5D=true&columns%5B0%5D%5Borderable%5D=true&columns%5B0%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B0%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B1%5D%5Bdata%5D=1&columns%5B1%5D%5Bname%5D=&columns%5B1%5D%5Bsearchable%5D=true&columns%5B1%5D%5Borderable%5D=false&columns%5B1%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B1%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B2%5D%5Bdata%5D=2&columns%5B2%5D%5Bname%5D=&columns%5B2%5D%5Bsearchable%5D=true&columns%5B2%5D%5Borderable%5D=false&columns%5B2%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B2%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B3%5D%5Bdata%5D=3&columns%5B3%5D%5Bname%5D=&columns%5B3%5D%5Bsearchable%5D=true&columns%5B3%5D%5Borderable%5D=false&columns%5B3%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B3%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B4%5D%5Bdata%5D=4&columns%5B4%5D%5Bname%5D=&columns%5B4%5D%5Bsearchable%5D=true&columns%5B4%5D%5Borderable%5D=false&columns%5B4%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B4%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B5%5D%5Bdata%5D=5&columns%5B5%5D%5Bname%5D=&columns%5B5%5D%5Bsearchable%5D=true&columns%5B5%5D%5Borderable%5D=false&columns%5B5%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B5%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B6%5D%5Bdata%5D=6&columns%5B6%5D%5Bname%5D=&columns%5B6%5D%5Bsearchable%5D=true&columns%5B6%5D%5Borderable%5D=false&columns%5B6%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B6%5D%5Bsearch%5D%5Bregex%5D=false&columns%5B7%5D%5Bdata%5D=7&columns%5B7%5D%5Bname%5D=&columns%5B7%5D%5Bsearchable%5D=true&columns%5B7%5D%5Borderable%5D=false&columns%5B7%5D%5Bsearch%5D%5Bvalue%5D=&columns%5B7%5D%5Bsearch%5D%5Bregex%5D=false&order%5B0%5D%5Bcolumn%5D=0&order%5B0%5D%5Bdir%5D=asc&start=300&length=100&search%5Bvalue%5D=&search%5Bregex%5D=false&args%5BinitialLetter%5D=&iDisplayLength=${size}&iDisplayStart=${pageId}&sSortDir_0=asc&sSortField=name`

    var response = await down(
      {
        id: `getEuronextEtfListInPage[${pageId / size}]`,
        source,
        url: URI,
        method: 'POST',
        data: dataString,
        responseType: 'json',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0',
          Accept: 'application/json, text/javascript, */*; q=0.01',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: 'https://live.euronext.com/products/etfs/list',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'X-Requested-With': 'XMLHttpRequest',
          Origin: 'https://live.euronext.com',
          Connection: 'close',
          Cookie:
            'visid_incap_2784297=cpBz9Ql+Ssy0K7IofnlqXlV+OWMAAAAAQUIPAAAAAACNlyJvlBvkyOVvOHMLWoz8; cookie-agreed-version=1.0.1; visid_incap_2691598=XYi6UgQGTRerhn1qd8waklh+OWMAAAAAQUIPAAAAAACxvDbJEzjaoMi3rhWvW+as; cookie-agreed=2; cookie-agreed-categories=%5B%22necessary%22%2C%22performance%22%5D; incap_ses_448_2784297=4iJiSX/HFxvhTnmpWp43BtqTOWMAAAAA6I3SarkK+gdr626kJ0+5+g==; incap_ses_448_2784297=1xJ7TbZOHBCAnH2pWp43BneYOWMAAAAAck9b3uHtrBMWIYglRPRPWg==',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-GPC': '1',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
        },
      },
      logTab + 1
    )

    return await extractSecuritiesFromTags(source, response.data.aaData, logTab + 1)
  } catch (err) {
    catchError(err, 'getEuronextEtfListInPage', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getAllSecuritiesDetails(
  source: string,
  securities: EuronextETF[],
  sourceConfig: EuronextETFSourceConfig,
  logTab: number
): Promise<EuronextETF[]> {
  try {
    lg(`START - getAllSecuritiesDetails[${source}]`, logTab, 'info', source)
    let chunks = arrayToChunks(securities, sourceConfig.chunck_size, logTab + 1, source)
    let all_data: EuronextETF[] = []
    for (let i = 0; i < chunks.length; i++) {
      if (i >= sourceConfig.chunks_limit) {
        lg(
          `getAllSecuritiesDetails[${source}] : Chunk limit [ ${sourceConfig.chunks_limit} ] reached !`,
          logTab + 1,
          'info',
          source
        )
        all_data = _.flatten(all_data)
        return all_data
      }
      lg(``, logTab + 1, 'info', source)
      lg(
        `getAllSecuritiesDetails[${source}] : Process chunk = ${i} | remaining = ${chunks.length - (i + 1)}`,
        logTab + 2,
        'info',
        source
      )
      all_data = all_data.concat(
        await Promise.all(
          chunks[i].map(async (company: EuronextETF) => {
            return await getOneSecurityDetails(source, company, sourceConfig, logTab + 3)
          })
        )
      )
      await pleaseWait(sourceConfig.delay_min, sourceConfig.delay_max, logTab + 2, source)
    }
    all_data = _.flatten(all_data)
    return all_data
  } catch (err) {
    catchError(err, `getAllSecuritiesDetails[${source}]`, undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getOneSecurityDetails(
  source: string,
  security: EuronextETF,
  sourceConfig: EuronextETFSourceConfig,
  logTab: number
) {
  try {
    const subType = await getOneSecuritySubType(source, security, logTab + 1)
    const issuerDescriptionLaunchDate = await getOneSecurityIssuerDescriptionLaunchDate(
      source,
      security,
      sourceConfig,
      logTab + 1
    )
    return { ...security, subType, ...issuerDescriptionLaunchDate }
  } catch (err) {
    catchError(err, 'getOneSecurityDetails', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getOneSecurityIssuerDescriptionLaunchDate(
  source: string,
  security: EuronextETF,
  sourceConfig: EuronextETFSourceConfig,
  logTab: number
) {
  try {
    const url = `https://live.euronext.com/en//ajax/getFactsheetInfoBlock/TRACK/${security.isin}-${security.market_symbol}/fs_generalinfo_block`
    let page = await down(
      {
        source,
        method: 'GET',
        url,
        id: `getOneSecurityLaunchDate[${security.label}]`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0',
          Accept: '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: `https://live.euronext.com/en/product/etfs/${security.isin}-${security.market_symbol}/market-information`,
          'X-Requested-With': 'XMLHttpRequest',
          Connection: 'keep-alive',
          Cookie:
            'visid_incap_2784297=cpBz9Ql+Ssy0K7IofnlqXlV+OWMAAAAAQUIPAAAAAACNlyJvlBvkyOVvOHMLWoz8; cookie-agreed-version=1.0.1; visid_incap_2691598=XYi6UgQGTRerhn1qd8waklh+OWMAAAAAQUIPAAAAAACxvDbJEzjaoMi3rhWvW+as; cookie-agreed=2; cookie-agreed-categories=%5B%22necessary%22%2C%22performance%22%5D; incap_ses_448_2784297=KTilU51s3zKc34WpWp43BtafOWMAAAAAAuNOKTkv7TZEDcc8hzZ52g==; incap_ses_448_2784297=1xJ7TbZOHBCAnH2pWp43BneYOWMAAAAAck9b3uHtrBMWIYglRPRPWg==',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-GPC': '1',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          TE: 'trailers',
        },
      },
      logTab + 1
    )

    const rows: LabelValueRow[] = await getTrsFromPage(
      page.data,
      '.table > tbody tr',
      sourceConfig.issuerDescriptionLanuchDateTargetTDs,
      999,
      'text',
      logTab + 1,
      true,
      source,
      `getOneSecurityIssuerDescriptionLaunchDate[${security.label}]`
    )

    const issuerName = rows.find(row => row?.label === 'Issuer Name')?.value
    const securityDescription = rows.find(row => row?.label === 'ETF Legal Name')?.value
    const launchDate = rows.find(row => row?.label === 'Launch Date')?.value

    return { issuerName, securityDescription, launchDate }
  } catch (err) {
    catchError(err, 'getOneSecurityIssuerDescriptionLaunchDate', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getOneSecuritySubType(
  source: string,
  security: EuronextETF,
  logTab: number
): Promise<string> {
  try {
    const url = `https://live.euronext.com/en//ajax/getFactsheetInfoBlock/TRACK/${security.isin}-${security.market_symbol}/fs_info_block`
    let page = await down(
      {
        source,
        method: 'GET',
        url,
        id: `getOneSecuritySubType[${security.label}]`,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:105.0) Gecko/20100101 Firefox/105.0',
          Accept: '*/*',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate, br',
          Referer: `https://live.euronext.com/en/product/etfs/${security.isin}-${security.market_symbol}/market-information`,
          'X-Requested-With': 'XMLHttpRequest',
          Connection: 'keep-alive',
          Cookie:
            'visid_incap_2784297=cpBz9Ql+Ssy0K7IofnlqXlV+OWMAAAAAQUIPAAAAAACNlyJvlBvkyOVvOHMLWoz8; cookie-agreed-version=1.0.1; visid_incap_2691598=XYi6UgQGTRerhn1qd8waklh+OWMAAAAAQUIPAAAAAACxvDbJEzjaoMi3rhWvW+as; cookie-agreed=2; cookie-agreed-categories=%5B%22necessary%22%2C%22performance%22%5D; incap_ses_448_2784297=KTilU51s3zKc34WpWp43BtafOWMAAAAAAuNOKTkv7TZEDcc8hzZ52g==; incap_ses_448_2784297=1xJ7TbZOHBCAnH2pWp43BneYOWMAAAAAck9b3uHtrBMWIYglRPRPWg==',
          'Sec-Fetch-Dest': 'empty',
          'Sec-Fetch-Mode': 'cors',
          'Sec-Fetch-Site': 'same-origin',
          'Sec-GPC': '1',
          Pragma: 'no-cache',
          'Cache-Control': 'no-cache',
          TE: 'trailers',
        },
      },
      logTab + 1
    )
    let launchDateTag = await getOneTag(
      '.table > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(2)',
      page.data,
      'text',
      logTab + 1,
      source
    )
    return launchDateTag.content as string
  } catch (err) {
    catchError(err, 'getOneSecuritySubType', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}
