import * as express from 'express'
import { logUserIP, catchError, saveToCSV } from '../../services/tools'
import {
  getEuronextETFsUpdates,
  getEuronextEtfListInPage,
  getAllSecurities,
  getOneSecurityDetails,
  getOneSecuritySubType,
  getOneSecurityIssuerDescriptionLaunchDate,
  getAllSecuritiesDetails,
} from '../../services/functions/Feuronextetf'

const router = express.Router()
export default router

let source = 'euronextetf'
let logTab = 1

const sourceConfig: EuronextETFSourceConfig = global.gfinalConfig[source]

router.get('/', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    let csvObj = await getEuronextETFsUpdates(source, sourceConfig, logTab)
    let full_file_path = await saveToCSV(csvObj, source, logTab, source)
    res.download(full_file_path)
  } catch (err) {
    catchError(err, '/', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.get('/getEuronextEtfListInPage', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const pageId = parseInt(req.body.pageId)
    let csvObj = await getEuronextEtfListInPage(source, pageId, sourceConfig, logTab)
    res.send(csvObj)
  } catch (err) {
    console.error(err)
    catchError(err, '/getEuronextEtfListInPage', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.get('/getAllSecurities', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    let csvObj = await getAllSecurities(source, sourceConfig, logTab)
    res.json(csvObj)
  } catch (err) {
    catchError(err, '/getAllSecurities', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})
router.post('/getAllSecuritiesDetails', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const securities: EuronextETF[] = req.body
    let csvObj = await getAllSecuritiesDetails(source, securities, sourceConfig, logTab)
    res.json(csvObj)
  } catch (err) {
    catchError(err, '/getAllSecuritiesDetails', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.post('/getOneSecurityDetails', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    let details = await getOneSecurityDetails(source, req.body, sourceConfig, logTab)
    res.json(details)
  } catch (err) {
    catchError(err, '/getOneSecurityDetails', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.post('/getOneSecurityIssuerDescriptionLaunchDate', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const security: EuronextETF = req.body
    const issuerDescriptionLaunchDate = await getOneSecurityIssuerDescriptionLaunchDate(
      source,
      security,
      sourceConfig,
      logTab
    )
    res.json(issuerDescriptionLaunchDate)
  } catch (err) {
    catchError(err, '/getOneSecurityLaunchDate', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})

router.post('/getOneSecuritySubType', async (req, res) => {
  try {
    req.setTimeout(20 * 60 * 60 * 1000) //force timeout to 4 hours
    logUserIP(req)
    const security: EuronextETF = req.body
    const subType = await getOneSecuritySubType(source, security, logTab)
    res.json({ subType })
  } catch (err) {
    catchError(err, '/getOneSecuritySubType', undefined, undefined, logTab, source)
    res.status(500).send(`Server Error`)
  }
})
