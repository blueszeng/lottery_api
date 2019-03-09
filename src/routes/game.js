import Router from 'koa-router'
import game from '../controllers/game'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/game'
})

/**
 * @swagger
 * /api/game:
 *  get:
 *    tags:
 *      - Game
 *    description: 获得所有游戏
 *    produces:
 *      -"application/json"
 *    responses:
 *      200:
 *          description: 返回所有游戏类型
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/', wrapRoute(game.gameList))

/**
 * @swagger
 * /api/game/boxlist:
 *  get:
 *    tags:
 *      - Game
 *    description: 获得游戏的所有箱子列表
 *    produces:
 *      -"application/json"
 *    parameters:
 *      - in: "query"
 *        name: "gameId" 
 *        description: 游戏id
 *        required: true
 *        type: "string"
 *    responses:
 *      200:
 *          description: 返回所有游戏箱子列表
 *      510:
 *          description: 服务器异常
 *      412:
 *          description: 参数校验错误
 */
router.get('/boxlist', wrapRoute(game.getGameBoxList))

module.exports = router