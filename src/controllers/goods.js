import models from '../models/index'
import { Joi, validate } from '../utils/validator'

import debug from '../utils/debug'
const log = debug('goods=>')

/**
 * 获取游戏里所有兑换的物品
 */
const getExChangeGoods = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        gameId: Joi.number().required().label('游戏id'),
        offset: Joi.number().min(0).label('第几页'),
        limit: Joi.number().min(0).label('多少条'),
        goods_name: Joi.string().label('查询名称'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log('验证参数错误', err.message)
        return Promise.reject(err.message)
    }

    try {
        let pageLen = 10
        let gameId = query.gameId
        let game = await models.Game.findOne({
            attributes: ['id', 'name'],
            where: {
                id: gameId
            }
        })
        let offset = query.offset || 0
        offset = offset * pageLen
        let limit = query.limit || 10
        let where = { game_id: gameId }
        if (query.goods_name) {
            where.name = query.goods_name
        }
        let goods = await models.Goods.findAll({
            attributes: ['id', 'img', 'name', 'skin_name', 'discrable', 'exchange_price'],
            offset,
            limit,
            where,
        })
        return Promise.resolve({
            game,
            goods
        })
    } catch (err) {
        return Promise.reject(err.message)
    }
}




/**
 * 分类获取物品
 */
const getKindGoods = async(ctx, next) => {
    let model = ctx.params.model
    const validSchema = Joi.object().keys({
        model: Joi.number().required().label('物品型号')
    })
    try {
        let tmpArgs = await validate({ model }, validSchema)
        model = tmpArgs.model
    } catch (err) {
        return Promise.reject(err.message)
    }

    try {
        let goods = await models.Goods.findAll({
            attributes: ['id', 'img', 'name', 'skin_name', 'discrable', 'sell_price'],
            where: { goods_model_id: model }
        })
        return Promise.resolve({
            goods
        })
    } catch (err) {
        return Promise.reject(err.message)
    }
}


export default {
    getExChangeGoods,
    getKindGoods
}