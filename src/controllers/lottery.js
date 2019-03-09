import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import debug from '../utils/debug'
import util from '../utils/util'
import { OPEN_BOX } from '../utils/const'
import Sequelize from 'sequelize'
import statisMgr from '../common/statisMgr'
const Op = Sequelize.Op
const log = debug(__filename)
import config from '../configs/config'
const Lucky = config.cst.Lucky




/**
 * 获得幸运抽奖价格范围
 */
const luckyRange = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        goodsId: Joi.number().required().min(1).label('宝箱id'),
    })
    try {
        const { goodsId } = await validate(query, validateSchema)
        let goods = await models.Goods.findOne({
            attributes: ['id', 'max_cost_price', 'min_cost_price', 'name', 'skin_name'],
            where: { id: goodsId }
        })
        goods.setDataValue('max_chance', Lucky.maxChance)
        goods.setDataValue('min_chance', Lucky.minChance)
        return Promise.resolve({
            goods
        })
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }
}


/**
 * 获得幸运抽奖价格范围
 */
const luckyLottery = async(ctx, next) => {

    try {
        const validateSchema = Joi.object().keys({
            amount: Joi.number().integer().min(1).max(20000).required().label('需要金额'),
            section: Joi.number().integer().min(5).max(75).required().label('所选区间值'),
            goodsId: Joi.number().integer().required().label('物品Id'),
        })
        const body = await validate(ctx.request.body, validateSchema)
        const goodsId = body.goodsId
        let goods = await models.Goods.findOne({
            attributes: ['id', 'img', 'name', 'goods_model_id', 'max_cost_price', 'min_cost_price', 'skin_name', 'goods_qualities_id'],
            where: { id: goodsId }
        })
        const minCost = goods.min_cost_price
        const maxCost = goods.max_cost_price
        const minChance = Lucky.minChance
        const maxChance = Lucky.maxChance
        const needMoney = (minCost + (maxCost - minCost) * (body.section - minChance) / (maxChance - minChance)).toFixed(2)
            // console.log(needMoney)

        // if (needMoney !== body.amount) { // 参数错误 
        //     return Promise.reject('参数错误')
        // }

        const userId = ctx.state.userId || 1
        let user = await models.User.findById(userId)
        let dollar_money = user.dollar_money
        if (dollar_money < needMoney) {
            return Promise.reject('余额不足')
        }

        dollar_money -= needMoney
        await user.update({ // 更新金币
            dollar_money
        })

        let goodsQualitie = await models.GoodsQualities.findOne({
            attributes: ['img'],
            where: { id: goods.goods_qualities_id }
        })

        let retAward = []
        let goodsList = []
        const randomNum = util.random(1, 100) //随机数
        if (randomNum <= body.section) { //得到这个物品
            let userGoods = await models.UserGoods.findOne({ where: { goods_id: goodsId } })
            if (userGoods) {
                userGoods.increment('goods_num', { by: 1 })
                await userGoods.save()
            } else {
                await models.UserGoods.create({
                    uid: userId,
                    goods_id: goodsId,
                    goods_num: 1
                })
            }
            retAward.push({
                img: goods.img,
                name: goods.name,
                goodsId: goodsId,
                goodsQualitie: goodsQualitie.img,
                uid: userId,
                uName: user.name,
                uHead: user.head
            })
        } else { // 得到垃圾装备
            goodsList = await models.Goods.findAll({
                attributes: ['id', 'skin_name', 'name', 'goods_qualities_id'],
                where: {
                    id: {
                        [Op.lte]: Lucky.inferiorPrice
                    }
                }
            })
            const goodsIdx = util.random(1, goodsList.length) // 随机任意一件垃圾装备 
            goods = goodsList[goodsIdx]
            let goodsQualitie = await models.GoodsQualities.findOne({
                attributes: ['img'],
                where: { id: goods.goods_qualities_id }
            })
            retAward.push({
                img: goods.img,
                name: goods.name,
                goodsId: goodsId,
                goodsModel: goodsQualitie.img,
                uid: userId,
                uName: user.name,
                uHead: user.head
            })
        }
        await models.WinPrizePush.create({ uid: userId, type: OPEN_BOX, goods_id: goods.id })

        //添加统计数据
        statisMgr.addBoxAwardMsg(retAward)
        statisMgr.setOpenBoxNum(retAward.length)

        return Promise.resolve({
            goods
        })
    } catch (err) {
        log(err.message)
        return Promise.reject(err.message)
    }
}




/**
 * 抽奖函数根据权重来抽
 */
function lotteryDraw(boxGoods, weightList, weights, num) {
    let result = []
    for (let i = 0; i < num; i++) {
        const randomNum = util.random(1, weights) //随机数
        for (let i in boxGoods) {
            console.log('lotteryDraw==>', randomNum, weightList, i)
            if (randomNum <= weightList[i]) {
                result.push(boxGoods[i]['goods_id'])
                break
            }
        }
    }
    return result
}

/**
 * 开箱
 */
const openBox = async(ctx, next) => {
    let { query } = ctx.request
    const validateSchema = Joi.object().keys({
        boxId: Joi.number().required().min(1).label('宝箱id'),
        num: Joi.number().required().min(1).max(5).label('数量'),
    })
    let num
    try {
        query = await validate(query, validateSchema)
        num = query.num
    } catch (err) {
        log('验证参数错误', err.message)
        return Promise.reject(err.message)
    }

    let { pirce } = await models.Box.findOne({ // 查找宝盒价格
        attributes: ['pirce'],
        where: { id: query.boxId, show: 1 }
    })
    const money = pirce * num
    const userId = ctx.state.userId || 1

    let user = await models.User.findById(userId)
    let dollar_money = user.dollar_money
    if (dollar_money < money) {
        return Promise.reject('余额不足')
    }

    let boxGoods = await models.BoxGoods.findAll({
        attributes: ['id', 'box_id', 'goods_id', 'drop_probability'],
        where: { box_id: query.boxId, show: 1 }
    })
    let weightList = []
    let weights = 0
    boxGoods.forEach((boxGood) => { //计算所有概率权重和
        weights += boxGood.drop_probability
        weightList.push(weights)
    })
    console.log('weights==>', weights)
    const awards = lotteryDraw(boxGoods, weightList, weights, num) //抽奖
    console.log('awards==>', awards)
    let retAward = []
    try {
        dollar_money -= money
        await user.update({ // 更新金币
            dollar_money
        })
        let goodsList = []
        for (let i in awards) { // 加道具
            let userGoods = await models.UserGoods.findOne({ where: { goods_id: awards[i] } })
            if (userGoods) {
                userGoods.increment('goods_num', { by: 1 })
                await userGoods.save()
            } else {
                await models.UserGoods.create({
                    uid: userId,
                    goods_id: awards[i],
                    goods_num: 1
                })
            }
            // 保存抽奖记录
            await models.WinPrizePush.create({ uid: userId, type: OPEN_BOX, goods_id: awards[i] })
            const goods = await models.Goods.findOne({
                attributes: ['img', 'name', 'id', 'goods_qualities_id'],
                where: { id: awards[i] }
            })
            goodsList.push(goods)
            let goodsQualitie = await models.GoodsQualities.findOne({
                attributes: ['img'],
                where: { id: goods.goods_qualities_id }
            })
            retAward.push({ // 保存中奖推送消息
                img: goods.img,
                name: goods.name,
                goodsId: goods.id,
                goodsQualitie: goodsQualitie.img,
                uid: userId,
                uName: user.name,
                uHead: user.head
            })
        }
        //添加统计数据
        statisMgr.addBoxAwardMsg(retAward)
        statisMgr.setOpenBoxNum(retAward.length)
        return Promise.resolve(goodsList)

    } catch (err) {
        return Promise.reject(`抽奖失败${err.message}`)
    }
}



export default {
    openBox,
    luckyRange,
    luckyLottery
}