import Router from 'koa-router'
import box from '../controllers/box'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/box'
})



/**
 * @swagger
 * /api/box/{boxId}:
 *   get:
 *     tags:
 *       - Box
 *     description: 获取宝箱物品列表
 *     produces:
 *       - application/json
 *     parameters:
 *     - in: "path"
 *       name: "boxId" 
 *       type: "integer"
 *       required: true
 *       description: 宝箱id
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
router.get('/:boxId', wrapRoute(box.getBox))

module.exports = router