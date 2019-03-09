import models from '../models/index'
import { Joi, validate } from '../utils/validator'

/**
 * 赠送装备
 */
const giveGoods = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        goodsId: Joi.number().required().min(1).label('物品id'),
        recvUid: Joi.number().required().min(1).label('接收物品uid'),
        goodsNum: Joi.number().required().min(1).label('物品数量'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }

    try {
        let recvUser = await models.User.findById(query.recvUid)
        if (recvUser === null) {
            return Promise.reject('接受物品玩家不存在')
        }

        const userId = ctx.state.userId || 1
        let user = await models.User.findById(userId)

        let userGoods = await models.UserGoods.findOne({
            attributes: ['id', 'goods_id', 'goods_num'],
            where: { uid: userId, goods_id: query.goodsId }
        })
        if (userGoods && userGoods.goods_num < query.goodsNum) {
            return Promise.reject('玩家物品不够')
        }

        let recvUserGoods = await models.UserGoods.findById(userGoods.id) // 累加物品
        if (recvUserGoods) {
            userGoods.increment('goods_num', { by: query.goodsNum })
            await userGoods.save()
        } else {
            await models.UserGoods.create({
                uid: query.recvUid,
                goods_id: query.goodsId,
                goods_num: query.goodsNum,
            })
        }
        if (userGoods.goods_num > query.goodsNum) { // 减少物品
            userGoods.increment('goods_num', { by: -query.goodsNum })
            await userGoods.save()
        } else {
            userGoods.destroy()
        }

        await models.GiveGoods.create({ // 添加一条赠送物品记录
            send_uid: userId,
            recv_uid: query.recvUid,
            goods_id: query.goodsId,
            goods_num: query.goodsNum,
        })
        return Promise.resolve(true)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }

}

/**
 * 兑换装备出游戏
 */
const exChangeOutGoods = async(ctx, next) => {

}

/**
 * 分解装备
 */
const decomposeGoods = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        type: Joi.number().required().min(1).max(2).label('分解类型'),
        goodsId: Joi.number().required().min(1).label('物品id'),
        goodsNum: Joi.number().required().min(1).label('物品数量'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }
    try {

        const userId = ctx.state.userId || 1
        let user = await models.User.findById(userId)
        let userGoods = await models.UserGoods.findOne({
            attributes: ['id', 'goods_id', 'goods_num'],
            where: { uid: userId, goods_id: query.goodsId }
        })
        if (userGoods && userGoods.goods_num < query.goodsNum) {
            return Promise.reject('玩家物品不够')
        }

        let goods = await models.Goods.findOne({
            attributes: ['sell_price', 'decompose_dollar_py', 'decompose_exchange_py', 'skin_name'],
            where: { id: goodsId }
        })
        let earnMoney = 0
        if (query.type === 1) { // 美元兑换
            earnMoney = goods.decompose_dollar_py * goods * sell_price * query.goodsNum
            user.increment('dollar_money', { by: earnMoney })
        } else { // 兑换币兑换
            earnMoney = goods.decompose_exchange_py * goods * sell_price * query.goodsNum
            user.increment('exchange_money', { by: earnMoney })
        }
        await user.save()
        if (userGoods.goods_num > query.goodsNum) { // 减少物品
            userGoods.increment('goods_num', { by: -query.goodsNum })
            await userGoods.save()
        } else {
            userGoods.destroy()
        }
        await models.DecomposeGoods.create({ // 添加一条分解记录
            uid: userId,
            money_type: query.type,
            money: earnMoney,
            goods_id: query.goodsId,
            goods_num: query.goodsNum,
        })

    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }

}


/**
 * 获取用户记录数据
 */
const recordData = async(ctx, next) => {
    //  1.掉落，2 赠送， 3，分解， 4.兑换， 5.充值。
}

export default {
    giveGoods,
    exChangeOutGoods,
    decomposeGoods,
    recordData
}