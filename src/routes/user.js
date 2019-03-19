import Router from 'koa-router'
import { wrapAllRoute } from '../utils/wrapRoute'
import user from '../controllers/user'
import pay from '../controllers/pay'

wrapAllRoute(pay)
wrapAllRoute(user)

const router = Router({
    prefix: '/user'
})



/**
 * @swagger
 * /api/user/giveGoods:
 *  get:
 *    tags:
 *      - user
 *    description: 赠送物品
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "goodsId"
 *        description: 物品id
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "recvUid"
 *        description: 接收物品uid
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsNum"
 *        required: true
 *        description: 物品数量
 *        type: "integer"
 *    responses:
 *      200:
 *          description: 返回成功
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/giveGoods', user.giveGoods) // 赠送装备



/**
 * @swagger
 * /api/user/exChangeOutGoods:
 *  get:
 *    tags:
 *      - user
 *    description: 兑出物品到游戏
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "gameId"
 *        description: 游戏类型
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsId"
 *        description: 物品id
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsNum"
 *        required: true
 *        description: 物品数量
 *        type: "integer"
 *      - in: "query"
 *        name: "gameRegion"
 *        required: true
 *        description: 游戏具体区服
 *        type: "string"
 *      - in: "query"
 *        name: "game_account"
 *        required: true
 *        description: 游戏帐号
 *        type: "string"
 *    responses:
 *      200:
 *          description: 返回成功
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/exChangeOutGoods', user.exChangeOutGoods) // 兑换物品出游戏



/**
 * @swagger
 * /api/user/decomposeGoods:
 *  get:
 *    tags:
 *      - user
 *    description: 分解物品
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "type"
 *        description: 分解币类型(1分解成美元，2分解成兑换币)
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsId"
 *        description: 物品id
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsNum"
 *        required: true
 *        description: 物品数量
 *        type: "integer"
 *    responses:
 *      200:
 *          description: 返回成功
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/decomposeGoods', user.decomposeGoods) // 分解物品


/**
 * @swagger
 * /api/user/records:
 *  get:
 *    tags:
 *      - user
 *    description: 获取用户记录数据
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "type"
 *        description: 记录类型(1.掉落，2 赠送， 3，分解， 4.兑换， 5.充值)
 *        required: true
 *        type: "integer"
 *    responses:
 *      200:
 *          description: 返回成功
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/records', user.recordData) // 获取用户记录数据


/**
 * @swagger
 * /api/user/getPayInfo:
 *  get:
 *    tags:
 *      - user
 *    description: 获取充值美元兑换比率
 *    produces:
 *      -"application/json"
 *    responses:
 *      200:
 *          description: 返回成功
 *      510:
 *          descriptigeton: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/getPayInfo', pay.getPayInfo) // 获取充值配置


/**
 * @swagger
 * /api/user/alipayCreateOrder:
 *  get:
 *    tags:
 *      - user
 *    description:  生成充值二维码
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "money"
 *        description: 充值人民币金额
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "dollar_money"
 *        description: 充值美元金额
 *        required: true
 *        type: "integer"
 *    responses:
 *      200:
 *          description: 返回成功
 *      510:
 *          descriptigeton: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/alipayCreateOrder', pay.alipayCreateOrder) // 生成二维码 

router.post('/alipayPayNotify', pay.alipayPayNotify) // 充值回调


module.exports = router