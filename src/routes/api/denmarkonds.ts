import * as express from 'express'
import { logUserIP, catchError, saveToCSV } from '../../services/tools'
import { getDenmarkBondsListInPage, getDenmarkUpdates } from '../../services/functions/Fdenmarkbonds'

const router = express.Router()
export default router

let source = 'denmarkbonds'
let logTab = 1

const sourceConfig: DenmarkBondsourceConfig = global.gfinalConfig[source]

router.get('/', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    let csvObj = await getDenmarkUpdates(source, sourceConfig, logTab)
    let full_file_path = await saveToCSV(csvObj, source, logTab, source)
    res.download(full_file_path)
  } catch (err) {
    catchError(err, '/', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.get('/getDenmarkBondsListInPage', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const pageId = parseInt(req.body.pageId)
    let csvObj = await getDenmarkBondsListInPage(source, sourceConfig, logTab, pageId)
    res.json(csvObj)
  } catch (err) {
    console.error(err)
    catchError(err, '/getDenmarkBondsListInPage', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})
