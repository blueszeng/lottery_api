import models from '../models/index'
import { Joi, validate } from '../utils/validator'

/**
 * 赠送装备
 */
const giveGoods = async(ctx, next) => {}

/**
 * 兑换装备出游戏
 */
const exChangeOutGoods = async(ctx, next) => {}

/**
 * 分解装备
 */
const decomposeGoods = async(ctx, next) => {}

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