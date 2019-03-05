import Router from 'koa-router'
import lottery from '../controllers/lottery'
import { wrapRoute } from '../utils/wrapRoute'

const router = Router({
    prefix: '/lottery'
})

router.get('/openBox', wrapRoute(lottery.openBox))
router.get('/luckyRange', wrapRoute(lottery.luckyRange))
router.get('/luckyLottery', wrapRoute(lottery.luckyLottery))

module.exports = router