import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import _ from 'lodash'
/**
 * 获取游戏列表
 */
const gameList = async(ctx, next) => {
    let game = await models.Game.findAll({
        attributes: ['id', 'name', 'img', 'config'],
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
            // let box = await models.BoxType.findAll({
            //         attributes: ['id', 'name'],
            //         include: [{
            //             model: models.Box,
            //             attributes: ['id', 'img', 'name', 'pirce', 'open'],
            //             where: { game_id: gameId },
            //         }]
            //     })
        let box = await models.Box.findAll({
            attributes: ['id', 'img', 'name', 'price', 'state', 'box_type_id'],
            where: { game_id: gameId },
            include: [{
                model: models.BoxType,
                attributes: ['id', 'name', 'level'],
                where: { show: 1 },
            }]
        })
        box = JSON.stringify(box)
        box = JSON.parse(box)
        let groups = _.groupBy(box, 'box_type_id')
        let boxs = []
        for (let groupId in groups) {
            let groupBoxTypes = groups[groupId]
            let boxTypeObj = _.assign({}, groupBoxTypes[0].BoxType)
            boxTypeObj.boxs = []
            for (let groupTypeId in groupBoxTypes) {
                let groupBoxType = groupBoxTypes[groupTypeId]
                delete groupBoxType.box_type_id
                delete groupBoxType.BoxType
                boxTypeObj.boxs.push(groupBoxType)
            }
            boxs.push(boxTypeObj)
        }
        return Promise.resolve({
            boxs,
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