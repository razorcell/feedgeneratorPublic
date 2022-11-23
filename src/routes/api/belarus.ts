import * as express from 'express'
import { logUserIP, catchError, saveToCSV } from '../../services/tools'
import { getBelarusUpdates, getSecuritiesFromPage } from '../../services/functions/Fbelarus'

const router = express.Router()
export default router

const source = 'belarus'
const logTab = 1

const sourceConfig: BelarusSourceConfig = global.gfinalConfig[source]

// router.get('/', async (req, res) => {
//   try {
//     req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
//     logUserIP(req)
//     let csv_obj = await getBelarusUpdates(source, sourceConfig, logTab)
//     let full_file_path = await saveToCSV(csv_obj, 'belarus')
//     res.download(full_file_path)
//     // res.send(csv_obj);
//   } catch (err) {
//     lg(`getBelarus:  ${err.message}`, 2, 'error')
//     res.status(500).send(`Server Error`)
//   }
// })

router.get('/', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const csvObj = await getBelarusUpdates(source, sourceConfig, logTab)
    const full_file_path = await saveToCSV(csvObj, source, logTab, source)
    res.download(full_file_path)
  } catch (err) {
    catchError(err, '/', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.get('/getSecuritiesFromPage', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const pageId = parseInt(req.body.pageId)
    const data = await getSecuritiesFromPage(source, sourceConfig, logTab, pageId)
    res.json(data)
  } catch (err) {
    catchError(err, '/getSecuritiesFromPage', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})
