import Router from 'koa-router'
import goods from '../controllers/goods'
import goodsType from '../controllers/goodsType'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/goods'
})

router.get('/exchangeList', wrapRoute(goods.getExChangeGoods)) // 获取游戏里的兑换物品
router.get('/goodsTypesList', wrapRoute(goodsType.getGoodsTypes)) // 获得物品类型表
router.get('/goodsModel/:model', wrapRoute(goods.getKindGoods)) // 通过物品型号得到物品
module.exports = router