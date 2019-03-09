import Router from 'koa-router'
import exchange from '../controllers/exchange'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/exchange'
})





/**
 * @swagger
 * /api/exchange:
 *  get:
 *    tags:
 *      - Exchange
 *    description: 兑换物品
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "goodsId" 
 *        description: 物品id
 *        required: true
 *        type: "string"
 *    responses:
 *      200:
 *          description: 返回兑换的物品信息
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/', wrapRoute(exchange.exChangeGoods))

module.exports = router