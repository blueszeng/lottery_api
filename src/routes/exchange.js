import Router from 'koa-router'
import exchange from '../controllers/exchange'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/exchange'
})

router.get('/', wrapRoute(exchange.exChangeGoods))

module.exports = router