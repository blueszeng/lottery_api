import Router from 'koa-router'
import goods from '../controllers/goods'
import goodsType from '../controllers/goodsType'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/goods'
})


/**
 * @swagger
 * /api/goods/exchangeList:
 *  get:
 *    tags:
 *      - Goods
 *    description: 获得游戏兑换物品列表
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "gameId"
 *        description: 游戏id
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "page"
 *        description: 第几页
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsName"
 *        description: 查询物品名称
 *        type: "string"
 *    responses:
 *      200:
 *          description: 返回游戏兑换物品列表
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/exchangeList', wrapRoute(goods.getExChangeGoods)) // 获取游戏里的兑换物品


/**
 * @swagger
 * /api/goods/goodsTypesList:
 *  get:
 *    tags:
 *      - Goods
 *    description: 获得物品类型列表
 *    produces:
 *      -"application/json"
 *    responses:
 *      200:
 *          description: 返回游戏兑换物品列表
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/goodsTypesList', wrapRoute(goodsType.getGoodsTypes)) // 获得物品类型

/**
 * @swagger
 * /api/goods/goodsModel:
 *   get:
 *     tags:
 *       - Goods
 *     description: 通过物品型号得到物品
 *     produces:
 *       - application/json
 *     parameters:
 *      - in: "query"
 *        name: "modelId"
 *        description: 游戏型号id
 *        required: true
 *        type: "integer"
 *      - in: "query"
 *        name: "page"
 *        description: 第几页
 *        type: "integer"
 *      - in: "query"
 *        name: "goodsName"
 *        description: 查询物品名称
 *        type: "string"
 *     responses:
 *       200:
 *         description: 成功
 *         schema:
 *          type: "string"
 *          description: 返回参数自己查询
 *       510:
 *          description: 服务器异常
 *       412:
 *          description: 参数校验错误
 */
router.get('/goodsModel', wrapRoute(goods.getKindGoods)) // 通过物品型号得到物品
module.exports = router