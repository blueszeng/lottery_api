import models from '../models/index'
import { Joi, validate } from '../utils/validator'

import debug from '../utils/debug'
const log = debug('goods=>')

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
            attributes: ['exchange_price', 'name', 'skin_name', 'img'],
            where: { goods_id: query.goodsId }
        })
        const userId = ctx.state.userId
        let user = await models.User.findOne({ // 查找用户信息
            attributes: ['exchange_money', 'name', 'head'],
            where: { id: userId }
        })
        dollar_money = user.dollar_money
        if (dollar_money < goods.exchange_price) {
            return Promise.reject('兑换币不足')
        }
        exchange_money -= money
        await user.update({ // 更新金币
            exchange_money
        })
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
        let goodsModel = await models.GoodsModel.findOne({
            attributes: ['img'],
            where: { id: goodsId }
        })
        retAward.push({ // 保存中奖推送消息
            img: goods.img,
            name: goods.name,
            goodsId: goodsId,
            goodsModel: goodsModel.img,
            uid: userId,
            uName: user.name,
            uHead: user.head
        })

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