import Router from 'koa-router'
import pay from '../controllers/pay'

import { wrapAllRoute } from '../utils/wrapRoute'
wrapAllRoute(pay)

const router = Router({
    prefix: '/pay'
})

router.post('/getPayInfo', pay.getPayInfo)
router.post('/alipayPayNotify', pay.alipayPayNotify)
router.post('/alipayCreateOrder', pay.alipayCreateOrder)
module.exports = router