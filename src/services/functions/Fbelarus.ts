import cheerio from 'cheerio'
import { down } from '../Ffetch'

import { lg, catchError, pleaseWait, arrayToChunks } from '../tools'

export async function getBelarusUpdates(source: string, sourceConfig: BelarusSourceConfig, logTab: number) {
  try {
    lg(`Belarus: Get Updates`, 1)
    const all_securities = await getAllSecurities(source, sourceConfig, logTab)
    // all_securities = removeDuplicates(all_securities);
    lg(`Belarus: Finished`, 1)
    return all_securities
    return
  } catch (err) {
    catchError(err, 'getBelarusUpdates', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getAllSecurities(source: string, sourceConfig: BelarusSourceConfig, logTab: number) {
  try {
    const page_ids = Array.from(Array(sourceConfig.maximum_pages).keys())
    // clg(page_ids);
    const chunks = arrayToChunks(page_ids, sourceConfig.chunck_size, 2)
    let all_details = []
    for (let i = 0; i < chunks.length; i++) {
      // if (i < 24) continue;
      if (i >= sourceConfig.chunks_limit) {
        lg(`Chunk limit [ ${sourceConfig.chunks_limit} ] reached !`, 2)
        return all_details
      }
      lg(``)
      lg(`Process chunk = ${i} | remaining = ${chunks.length - (i + 1)}`, 2)

      all_details = all_details.concat(
        await Promise.all(
          chunks[i].map(async page_id => {
            return await getSecuritiesFromPage(source, sourceConfig, logTab, page_id)
          })
        )
      )
      all_details = [].concat.apply([], all_details) //flattern the array
      if (all_details.length == 0) {
        lg(`END reached-Stop`, 2)
        break
      }
      all_details = Array.from(new Set(all_details)) //Remove duplicates
      await pleaseWait(sourceConfig.delay_min, sourceConfig.delay_max, 2)
    }
    return all_details
    return
  } catch (err) {
    catchError(err, 'getAllSecurities', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getSecuritiesFromPage(
  source: string,
  sourceConfig: BelarusSourceConfig,
  logTab: number,
  page_id: number
) {
  try {
    let securities = []
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:80.0) Gecko/20100101 Firefox/80.0',
      Accept: 'text/html',
      'Accept-Language': 'en-US,en;q=0.5',
      // 'Accept-Encoding': 'gzip',
      Connection: 'close',
      'Upgrade-Insecure-Requests': '1',
      'If-Modified-Since': 'Wed, 23 Sep 2020 15:54:40 GMT',
      'Cache-Control': 'max-age=0',
      TE: 'Trailers',
    }
    const res = await down({
      source: 'belarus',
      url: `https://www.centraldepo.by/helpserv/emitent/?letter=&&page=${page_id}`,
      // savetofile: true,
    })
    securities = await getSecuritiesFromHTML(source, sourceConfig, logTab, res, page_id)
    return securities
    return
  } catch (err) {
    catchError(err, 'getSecuritiesFromPage', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

export async function getSecuritiesFromHTML(
  source: string,
  sourceConfig: BelarusSourceConfig,
  logTab: number,
  response: string | Buffer,
  page_id: number
) {
  try {
    const $ = cheerio.load(response)
    const data_blocks = $('div.em_dep_info').get()
    // .splice(0, 3);
    if (!Array.isArray(data_blocks) || data_blocks.length == 0) {
      lg(`Something is wrong, could not get data_blocks inside this page ID[${page_id}]`, 4, 'error')
      return false
    }

    // clg(data_blocks);

    const all_tables_securities_in_page = $(data_blocks).map((j, data_block) => {
      // clg("--Block [" + j + "]");
      // clg(data_block);
      // let issuer = $(td).contents().first().text().replace(/\s\s+/g, "");
      const h4s = $(data_block).find('h4').get()
      // clg(`****  Found ${h4s.length} H4 tags`);
      let desired_table = []
      let this_table_securities = []
      // let final_table_id;
      for (let i = 0; i < h4s.length; i++) {
        // clg("-------H4 [" + i + "]");
        if ($(h4s[i]).text() === 'Облигации') {
          desired_table = $(h4s[i]).next()
          if ($(desired_table).is('table')) {
            // clg("-----------------------------Data table found !");
            // clg(desired_table);
            const trs = $(desired_table).find('tr').get().slice(1)
            this_table_securities = trs.map((tr, tr_undx) => {
              const tds = $(tr).find('td').get()
              // clg(
              //   `------------------------------------TR [${tr_undx}] has ${tds.length} Tds`
              // );
              // clg(tds);
              return {
                isin: $(tds[0]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                issueserialnumber: $(tds[1]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                dateofstateregistration: $(tds[2]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                numberofstateregistration: $(tds[3]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                denomination: $(tds[4]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                currencyofparvalue: $(tds[5]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                quantity: $(tds[6]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                dateofcirculation: $(tds[7]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                enddateoftheappeal: $(tds[8]).text().replace('/&#?[a-z0-9]{2,8};/i', '').trim(),
                dateofremovalfromcentralizedstorage: $(tds[9])
                  .text()
                  .replace('/&#?[a-z0-9]{2,8};/i', '')
                  .trim(),
              }
            })
          }
          break
        }
      }
      return this_table_securities
    })
    lg(`Extracted ${all_tables_securities_in_page.get().length} securities from this page`, 4)
    // clg(all_tables_securities_in_page.get());
    return all_tables_securities_in_page.get()
  } catch (err) {
    catchError(err, 'getSecuritiesFromHTML', undefined, undefined, logTab, source)
    throw new Error(err)
  }
}

//HELPERS

// `
// // SELECT
// //         *
// //     FROM
// //         (SELECT
// //             scmst.SecID,
// //                 ISIN,
// //                 IssuerName,
// //                 SectyCD,
// //                 SecurityDesc,
// //                 PrimaryExchgCD,
// //                 NewLocalCode,
// //                 SharesOutstanding
// //         FROM
// //             scmst
// //         LEFT JOIN scexh ON scmst.secID = scexh.SecID
// //         LEFT JOIN issur ON scmst.IssID = issur.IssID
// //         LEFT JOIN lcc ON (scmst.SecID = lcc.SecID
// //             AND lcc.ExchgCD = PrimaryExchgCD)
// //         WHERE
// //             SectyCD IN ('EQS')
// //                 AND PrimaryExchgCD IN ('DESSE' , 'DEBSE', 'DEFSX', 'DEXETR', 'DEDSE', 'DEMSE', 'DEHNSE', 'DEHSE')
// //                 AND scmst.Actflag NOT IN ('D')
// //                 AND ISIN NOT IN ('')
// //                 AND ISIN IS NOT NULL
// //         ORDER BY lcc.Acttime DESC
// //         LIMIT 999999999) Tmp
// //     GROUP BY SecID`
