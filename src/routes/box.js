import Router from 'koa-router'
import box from '../controllers/box'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/box'
})

router.get('/:boxId', wrapRoute(box.getBox))

module.exports = router