import models from '../models/index'
import { Joi, validate } from '../utils/validator'

import debug from '../utils/debug'
import statisMgr from '../common/statisMgr'
const log = debug('goods=>')
import { OPEN_BOX } from '../utils/const'
/**
 * 兑换物品
 */
const exChangeGoods = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        goodsId: Joi.number().required().label('物品'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log('验证参数错误', err.message)
        return Promise.reject(err.message)
    }
    try {
        let goods = await models.Goods.findOne({
            attributes: ['exchange_price', 'name', 'skin_name', 'img', 'goods_qualities_id'],
            where: { id: query.goodsId }
        })
        let userId = ctx.state.userId
        userId = 1
        let user = await models.User.findById(userId)
        let exchange_money = user.exchange_money
        if (exchange_money < goods.exchange_price) {
            return Promise.reject('兑换币不足')
        }
        exchange_money -= goods.exchange_price
        console.log(exchange_money)
        await user.update({ // 更新金币
            exchange_money
        })
        console.log('fuckckckc')
        let userGoods = await models.UserGoods.findOne({ where: { goods_id: query.goodsId } })
        if (userGoods) { //加物品
            userGoods.increment('goods_num', { by: 1 })
            await user.save()
        } else {
            await models.UserGoods.create({
                uid: userId,
                goods_id: query.goodsId,
                goods_num: 1
            })
        }
        let goodsQualitie = await models.GoodsQualities.findOne({
                attributes: ['img'],
                where: { id: goods.goods_qualities_id }
            })
            // 保存兑换记录
        await models.WinPrizePush.create({ uid: userId, type: OPEN_BOX, goods_id: query.goodsId })
        let retAward = []
        retAward.push({ // 保存中奖推送消息
                img: goods.img,
                name: goods.name,
                goodsId: query.goodsId,
                goodsQualitie: goodsQualitie.img,
                uid: userId,
                uName: user.name,
                uHead: user.head
            })
            //添加统计数据
        statisMgr.addBoxAwardMsg(retAward)
        statisMgr.setOpenBoxNum(retAward.length)

        return Promise.resolve({
            goods
        })
    } catch (err) {
        return Promise.reject(err.message)
    }
}

export default {
    exChangeGoods
}