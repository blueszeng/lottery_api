import Router from 'koa-router'
import users from '../controllers/auth'
import csrf from '../middlewares/csrf'
import { wrapAllRoute } from '../utils/wrapRoute'
wrapAllRoute(users)

const router = Router({
    prefix: '/auth'
})


// router.post('/loginLocal', users.loginLocal) // 帐号登陆


/**
 * @swagger
 * definition:
 *   user:
 *     properties:
 *       id:
 *         type: integer
 *       head:
 *         type: string
 *       name:
 *         type: integer
 *       dollar_money:
 *         type: integer
 *       exchange_money:
 *         type: integer
 */

/**
 * @swagger
 * /api/auth/loginQQ:
 *   get:
 *     tags:
 *       - Auth
 *     description: qq登陆
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: "query"
 *       name: "code" 
 *       type: "string"
 *       required: true
 *       description: 微信code码
 *     responses:
 *       200:
 *         description: 返回用户信息
 *         schema:
 *           $ref: '#/definitions/user'
 *         headers:
 *           X-lottery-app-token:
 *              type: "string"
 *              format: "string"
 *              description: "token"
 *       510:
 *          description: 服务器异常
 *       412:
 *          description: 参数校验错误
 */


router.get('/loginQQ', users.loginQQ) //QQ 登陆

module.exports = router