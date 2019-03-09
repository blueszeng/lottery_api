import Router from 'koa-router'
import lottery from '../controllers/lottery'
import { wrapRoute } from '../utils/wrapRoute'

const router = Router({
    prefix: '/lottery'
})

/**
 * @swagger
 * /api/lottery/openBox:
 *  get:
 *    tags:
 *      - lottery
 *    description: 打开宝箱
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "boxId"
 *        description: 宝箱id
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "num"
 *        description: 数量
 *        type: "integer"
 *    responses:
 *      200:
 *          description: 返回打开宝箱的物品
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/openBox', wrapRoute(lottery.openBox))



/**
 * @swagger
 * /api/lottery/luckyRange:
 *  get:
 *    tags:
 *      - lottery
 *    description: 幸运抽奖物品概率范围
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "goodsId"
 *        description: 物品id
 *        required: true
 *        type: "integer"
 *    responses:
 *      200:
 *          description: 返回幸运抽奖物品概率范围
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/luckyRange', wrapRoute(lottery.luckyRange))



/**
 * @swagger
 * definition:
 *   lucky:
 *     properties:
 *       amount:
 *         type: integer
 *         description: 金额
 *       section:
 *         type: integer
 *         description: 所选区间值
 *       goodsId:
 *         type: integer
 *         description: 物品Id
 */

/**
 * @swagger
 * /api/lottery/luckyLottery:
 *  post:
 *    tags:
 *      - lottery
 *    description: 幸运抽奖
 *    produces:
 *      -"application/json"
 *    parameters:
 *     - in: "body"
 *       name: "body"
 *       required: true
 *       schema:
 *         $ref: "#/definitions/lucky"
 *    responses:
 *      200:
 *          description: 返回抽奖物品
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.post('/luckyLottery', wrapRoute(lottery.luckyLottery))

module.exports = router