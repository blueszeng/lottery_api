import models from '../models/index'
import { Joi, validate } from '../utils/validator'
/**
 * 获取游戏列表
 */
const gameList = async(ctx, next) => {
    let game = await models.Game.findAll({
        attributes: ['id', 'name'],
        where: { show: true }
    })
    return Promise.resolve(game)
}

/**
 * 获取游戏所有宝箱列表
 */
const getGameBoxList = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        gameId: Joi.number().required().label('游戏id'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log('验证下注参数错误', err.message)
        return Promise.reject(err.message)
    }
    let gameId = query.gameId
    try {
        let game = await models.Game.findOne({
            attributes: ['id', 'name'],
            where: { id: gameId }
        })
        let box = await models.BoxType.findAll({
            attributes: ['id', 'name'],
            where: { game_id: gameId },
            include: [{
                model: models.Box,
                attributes: ['id', 'img', 'name', 'pirce', 'open'],
                where: { show: 1 },
            }]
        })
        return Promise.resolve({
            box,
            game
        })
    } catch (err) {
        return Promise.reject(err.message)
    }
}

export default {
    gameList,
    getGameBoxList,
}