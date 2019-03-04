import Router from 'koa-router'
import users from '../controllers/auth'
import csrf from '../middlewares/csrf'
import { wrapAllRoute } from '../utils/wrapRoute'
wrapAllRoute(users)

const router = Router({
    prefix: '/auth'
})

router.post('/loginLocal', users.loginLocal) // 帐号登陆
router.post('/loginQQ', users.loginQQ) //QQ 登陆

module.exports = router