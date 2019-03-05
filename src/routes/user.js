import Router from 'koa-router'
import { wrapAllRoute } from '../utils/wrapRoute'
import user from '../controllers/user'
import pay from '../controllers/pay'

wrapAllRoute(pay)
wrapAllRoute(user)

const router = Router({
    prefix: '/user'
})

router.post('/giveGoods', user.giveGoods) // 赠送装备
router.post('/exChangeOutGoods', user.exChangeOutGoods) // 兑换装备出游戏
router.post('/decomposeGoods', user.decomposeGoods) // 分解装备
router.get('/recordData', user.decomposeGoods) // 获取用户记录数据

router.post('/getPayInfo', pay.getPayInfo) // 获取充值配置
router.post('/alipayPayNotify', pay.alipayPayNotify) // 充值回调
router.post('/alipayCreateOrder', pay.alipayCreateOrder) // 生成二维码 

module.exports = router