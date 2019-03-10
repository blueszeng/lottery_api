import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import util from '../utils/util'
import debug from '../utils/debug'
import Sequelize from 'sequelize'
const Op = Sequelize.Op
const log = debug('goods=>')
    /**
     * 赠送装备
     */
const giveGoods = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        goodsId: Joi.number().required().min(1).label('物品id'),
        recvUid: Joi.string().required().min(1).label('接收物品uid'),
        goodsNum: Joi.string().required().min(1).label('物品数量'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }
    try {
        const userId = ctx.state.userId || 1
        console.log(query.recvUid === userId, query.recvUid, userId)
        if (query.recvUid === userId) {
            return Promise.reject('不能给自己赠送')
        }
        let recvUser = await models.User.findById(query.recvUid)
        if (recvUser === null) {
            return Promise.reject('接受物品玩家不存在')
        }

        let user = await models.User.findById(userId)

        let userGoods = await models.UserGoods.findOne({
            attributes: ['id', 'goods_id', 'goods_num'],
            where: { uid: userId, goods_id: query.goodsId }
        })
        if (userGoods && userGoods.goods_num < query.goodsNum) {
            return Promise.reject('玩家物品不够')
        }

        let recvUserGoods = await models.UserGoods.findOne({
                where: {
                    uid: query.recvUid,
                    goods_id: query.goodsId
                }
            })
            // 累加物品
        if (recvUserGoods) {
            recvUserGoods.increment('goods_num', { by: query.goodsNum })
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
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        gameId: Joi.number().required().min(1).label('游戏类型'),
        goodsId: Joi.number().required().min(1).label('物品id'),
        goodsNum: Joi.number().required().min(1).label('物品数量'),
        game_account: Joi.string().required().min(1).label('游戏帐号'),
        gameRegion: Joi.string().min(1).label('游戏具体区服'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }

    try {
        const userId = ctx.state.userId || 1

        let userGoods = await models.UserGoods.findOne({
            attributes: ['id', 'goods_id', 'goods_num'],
            where: { uid: userId, goods_id: query.goodsId }
        })
        if (userGoods && userGoods.goods_num < query.goodsNum) {
            return Promise.reject('玩家物品不够')
        }
        if (userGoods.goods_num > query.goodsNum) { // 减少物品
            userGoods.increment('goods_num', { by: -query.goodsNum })
            await userGoods.save()
        } else {
            userGoods.destroy()
        }
        models.ExchangeGoods.create({ //添加一条兑换记录
            uid: userId,
            game_id: query.gameId,
            game_zone_info: query.gameRegion,
            goods_id: query.goodsId,
            goods_num: query.goodsNum,
            game_account: query.game_account,
            orderid: util.generateOrderNo(),
            state: 0
        })
        return Promise.resolve(true)

    } catch (err) {
        return Promise.reject(err.message)
    }
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
            where: { id: query.goodsId }
        })
        let earnMoney = 0
        if (query.type === 1) { // 美元兑换
            earnMoney = goods.decompose_dollar_py * goods.sell_price * query.goodsNum
            user.increment('dollar_money', { by: earnMoney })
        } else { // 兑换币兑换
            earnMoney = goods.decompose_exchange_py * goods.sell_price * query.goodsNum
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
        return Promise.resolve(true)

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
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        type: Joi.number().integer().required().min(1).max(5).label('记录类型'),
    })
    try {
        query = await validate(query, validateSchema)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }
    try {
        const userId = ctx.state.userId || 1
        let records = null
        switch (query.type) {
            case 1:
                records = await models.WinPrizePush.findAll({
                    attributes: ['created_at'],
                    where: { uid: userId },
                    include: [{
                        model: models.Goods,
                        attributes: ['id', 'name']
                    }]
                })
                for (let recordId in records) {
                    records[recordId].name = records[recordId].Good.name
                    records[recordId].setDataValue('goods_num', 1)
                    records[recordId].setDataValue('name', records[recordId].Good.name)
                    records[recordId].setDataValue('Good', undefined)
                }
                break
            case 2:
                records = await models.GiveGoods.findAll({
                    attributes: ['created_at', 'goods_num', 'recv_uid'],
                    where: { send_uid: userId },
                    include: [{
                        model: models.Goods,
                        attributes: ['id', 'name']
                    }]
                })
                let uids = []
                for (let recordId in records) {
                    uids.push(records[recordId].recv_uid)
                    records[recordId].name = records[recordId].Good.name
                    records[recordId].setDataValue('name', records[recordId].Good.name)
                    records[recordId].setDataValue('Good', undefined)
                }

                let users = await models.User.findAll({
                    attributes: ['id', 'name'],
                    where: {
                        id: {
                            [Op.in]: uids
                        }
                    }
                })
                let uidNameMap = {}
                users.forEach((element) => {
                    uidNameMap[element.id] = element.name
                })
                for (let recordId in records) {
                    records[recordId].setDataValue('recv_user', uidNameMap[records[recordId].recv_uid])
                    records[recordId].setDataValue('recv_uid', undefined)
                }
                break

            case 3:
                records = await models.DecomposeGoods.findAll({
                    attributes: ['created_at', 'money_type', 'money'],
                    where: { uid: userId },
                    include: [{
                        model: models.Goods,
                        attributes: ['id', 'name']
                    }]
                })
                for (let recordId in records) {
                    records[recordId].name = records[recordId].Good.name
                    records[recordId].setDataValue('goods_num', 1)
                    records[recordId].setDataValue('name', records[recordId].Good.name)
                    records[recordId].setDataValue('Good', undefined)
                }
                break
            case 4:
                records = await models.ExchangeGoods.findAll({
                    attributes: ['orderid', 'created_at', 'game_zone_info', 'goods_num', 'game_id', 'game_account', 'game_zone_info', 'state'],
                    where: { uid: userId },
                    include: [{
                        model: models.Goods,
                        attributes: ['id', 'name']
                    }]
                })
                let gameIds = []
                for (let recordId in records) {
                    gameIds.push(records[recordId].game_id)
                    records[recordId].name = records[recordId].Good.name
                    records[recordId].setDataValue('name', records[recordId].Good.name)
                    records[recordId].setDataValue('Good', undefined)
                }

                let games = await models.Game.findAll({
                    attributes: ['id', 'name'],
                    where: {
                        id: {
                            [Op.in]: gameIds
                        }
                    }
                })
                let gameIdNameMap = {}
                games.forEach((element) => {
                    gameIdNameMap[element.id] = element.name
                })
                for (let recordId in records) {
                    records[recordId].setDataValue('game', gameIdNameMap[records[recordId].game_id])
                    records[recordId].setDataValue('game_id', undefined)
                }
                break
            case 5:
                records = await models.Order.findAll({
                    attributes: ['sdcustomno', 'pay_type', 'money', 'dollar_money', 'state', 'created_at'],
                    where: { uid: userId },
                })
        }
        return Promise.resolve(records)
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }
}

export default {
    giveGoods,
    exChangeOutGoods,
    decomposeGoods,
    recordData
}