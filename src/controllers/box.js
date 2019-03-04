import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import debug from '../utils/debug'
import util from '../utils/util'
import { OPEN_BOX } from '../utils/const'

import statisMgr from '../common/statisMgr'

const log = debug(__filename)

/**
 * 获取宝箱物品列表
 */
const getBox = async(ctx, next) => {
    let boxId = ctx.params.boxId
    const validSchema = Joi.object().keys({
        boxId: Joi.number().required().label('宝箱编号')
    })
    try {
        let boxTmp = await validate({ boxId }, validSchema)
        boxId = boxTmp.boxId
    } catch (err) {
        return Promise.reject(err.message)
    }
    try {
        let { pirce } = await models.Box.findOne({
            attributes: ['pirce'],
            where: { id: boxId, show: 1 }
        })

        let boxGoods = await models.Box.findAll({
            include: [{
                model: models.Goods,
                attributes: ['id', 'icon', 'name'],
                through: {
                    attributes: ['drop_probability'],
                }
            }],
            attributes: ['pirce', 'name'],
            where: {
                id: boxId,
                show: 1
            }
        });
        return Promise.resolve(boxGoods)
    } catch (err) {
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
        where: { id: boxId, show: 1 }
    })
    const money = pirce * num
    const userId = ctx.state.userId

    let user = await models.User.findOne({ // 查找用户信息
        attributes: ['dollar_money'],
        where: { id: userId }
    })
    dollar_money = user.dollar_money
    if (dollar_money < money) {
        return Promise.reject('余额不足')
    }

    let boxGoods = await models.BoxGoods.findAll({
        attributes: ['id', 'box_id', 'goods_id', 'drop_probability'],
        where: { box_id: query.boxId, show: 1 }
    })
    weightList = []
    const weights = sumboxGoods.reduce((a, b) => { //计算所有概率权重和
        weightList.push(a.drop_probability + b.drop_probability)
        return a.drop_probability + b.drop_probability
    })
    const awards = lotteryDraw(boxGoods, weightList, weights, num) //抽奖
    let retAward = []
    try {
        dollar_money -= money
        await user.update({ // 更新金币
            dollar_money: dollar_money
        })
        for (let i in awards) { // 加道具
            let userGoods = await models.UserGoods.findOne({ where: { goods_id: awards[i] } })
            if (userGoods) {
                userGoods.increment('goods_num', { by: 2 })
                await user.save()
            } else {
                await models.User.create({
                    uid: userId,
                    goods_id: awards[i],
                    goods_num: 1
                })
            }
        }
        for (let i in awards) { // 保存抽奖记录
            await models.WinPrizePush.create({ uid: userId, type: OPEN_BOX, goods_id: awards[i] })
            const award = await models.Goods.findOne({
                attributes: ['icon', 'name', 'id'],
                where: { id: awards[i] }
            })
            retAward.push({
                icon: award['icon'],
                name: name['icon'],
                goodsId: name['id'],
                uid: userId,
                uName: user['name'],
                uHead: user['head']
            })
        }
        //添加统计数据
        statisMgr.addBoxAwardMsg(retAward)
        statisMgr.setOpenBoxNum(retAward.length)
    } catch (err) {
        return Promise.reject(`抽奖失败${err.message}`)
    }
    return Promise.resolve(retAward)
}



export default {
    getBox,
    openBox
}


// --use lottery;
// -- --
// -- --Dumping data
// for table `box_goods`
//     -- --
//     --
//     --LOCK TABLES `box_goods`
// WRITE;
// -- /*!40000 ALTER TABLE `box_goods` DISABLE KEYS */ ;
// --INSERT INTO `box_goods`
// VALUES(1, 1, 1, 0.3, 1, '2019-01-03 00:00:00', '2019-01-03 00:00:00'), (2, 1, 1, 0.3, 1, '2019-01-03 00:00:00', '2019-01-03 00:00:00'), (3, 1, 1, 0.3, 1, '2019-01-03 00:00:00', '2019-01-03 00:00:00');
// -- /*!40000 ALTER TABLE `box_goods` ENABLE KEYS */ ;
// --UNLOCK TABLES;
// --
// --
// --
// --LOCK TABLES `box_types`
// WRITE;
// -- /*!40000 ALTER TABLE `box_types` DISABLE KEYS */ ;
// --INSERT INTO `box_types`
// VALUES(1, 1, '低级宝箱', 30, 1, '2019-01-01 00:00:00', '2019-01-01 00:00:00'), (2, 1, '中级宝箱', 10, 1, '2019-01-01 00:00:00', '2019-01-01 00:00:00');
// -- /*!40000 ALTER TABLE `box_types` ENABLE KEYS */ ;
// --UNLOCK TABLES;
// --
// --
// --
// --LOCK TABLES `boxs`
// WRITE;
// -- /*!40000 ALTER TABLE `boxs` DISABLE KEYS */ ;
// --INSERT INTO `boxs`
// VALUES(1, 1, 'http://ddsd.png', '1号', 30, 1, 1, '2019-03-01 00:00:00', '2019-03-01 00:00:00'), (2, 1, 'https://ddsdsd.png', '2号', 10, 1, 0, '2019-03-02 00:00:00', '2019-03-02 00:00:00'), (3, 2, 'https://ddsdsd3.png', '3号', 5, 1, 1, '2019-03-03 00:00:00', '2019-03-03 00:00:00');
// -- /*!40000 ALTER TABLE `boxs` ENABLE KEYS */ ;
// --UNLOCK TABLES;
// --
// -- --
// -- --Table structure
// for table `decompose_goods_records`
//     -- --
//     --
//     --
//     --
//     -- --Dumping data
// for table `games`
//     -- --
//     --
//     --LOCK TABLES `games`
// WRITE;
// -- /*!40000 ALTER TABLE `games` DISABLE KEYS */ ;
// --INSERT INTO `games`
// VALUES(1, 'game1', 'http://dssd.png', 1, '2019-01-01 00:00:00', '2019-01-01 00:00:00'), (2, 'game2', 'http://dssd2.png', 1, '2019-01-01 00:00:00', '2019-01-01 00:00:00');
// -- /*!40000 ALTER TABLE `games` ENABLE KEYS */ ;
// --UNLOCK TABLES;
// --
// --
// --
// -- --
// -- --Dumping data
// for table `goods`
//     -- --
//     --
//     --LOCK TABLES `goods`
// WRITE;
// -- /*!40000 ALTER TABLE `goods` DISABLE KEYS */ ;
// --INSERT INTO `goods`
// VALUES(1, 'http://dsdsd.png', 1, 1, '火掐外套', 20, 101, 5, 0.5, 1, 1, '2019-03-03 00:00:00', '2019-03-04 00:00:00'), (2, 'http://23233.png', 1, 2, '屠龙', 250, 500, 10, 0.8, 0.9, 1, '2019-01-01 00:00:00', '2019-01-01 00:00:00');
// -- /*!40000 ALTER TABLE `goods` ENABLE KEYS */ ;
// --UNLOCK TABLES;
// --
// --
// -- --
// -- --Table structure
// for table `goods_types`
//     --
//     -- --Dumping data
// for table `goods_types`
//     -- --
//     --
//     --LOCK TABLES `goods_types`
// WRITE;
// -- /*!40000 ALTER TABLE `goods_types` DISABLE KEYS */ ;
// --INSERT INTO `goods_types`
// VALUES(1, 1, '衣服', 1, '2019-03-03 00:00:00', '2019-03-03 00:00:00'), (2, 1, '武器', 1, '2019-03-03 00:00:00', '2019-03-03 00:00:00');
// -- /*!40000 ALTER TABLE `goods_types` ENABLE KEYS */ ;
// --UNLOCK TABLES;
// --
// --

// let boxGoods = models.Box.findAll({
//     include: [{
//         model: models.Goods,
//         through: {
//             // attributes: ['createdAt', 'startedAt', 'finishedAt'],
//             where: { id: boxId }
//         }
//     }]
// });
// let boxGoods = await models.BoxGoods.findAll({
//         attributes: ['id', 'box_id', 'goods_id', 'drop_probability'],
//         where: { box_id: boxId, show: 1 },
//         include: {
//             model: models.Goods,
//             attributes: ['icon', 'name']
//         }
//     })
// let boxGoods = await models.BoxGoods.findAll({
//     attributes: ['id', 'box_id', 'goods_id', 'drop_probability'],
//     where: { box_id: boxId, show: 1 },
//     include: {
//         model: models.Goods,
//         attributes: ['icon', 'name']
//     }
// })
// let retBoxGoods = { price: pirce, boxId: boxId, goods: [] }
// for (let i in boxGoods) {
//     retBoxGoods.goods.push({
//         id: boxGoods[i]['id'],
//         goods_id: boxGoods[i]['goods_id'],
//         drop_probability: boxGoods[i]['drop_probability'],
//         icon: boxGoods[i]['Good']['icon'],
//         name: boxGoods[i]['Good']['name']
//     })
// }