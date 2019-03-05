import models from '../models/index'
import { Joi, validate } from '../utils/validator'

import debug from '../utils/debug'
const log = debug('goods=>')

/**
 * 获取物品类型
 */
const getGoodsTypes = async(ctx, next) => {
    try {
        let goodsTypes = await models.GoodsType.findAll({
            attributes: ['id', 'name'],
            include: [{
                model: models.GoodsModel,
                attributes: ['id', 'name'],
            }]
        })
        return Promise.resolve({
            goodsTypes
        })
    } catch (err) {
        return Promise.reject(err.message)
    }
}


export default {
    getGoodsTypes
}