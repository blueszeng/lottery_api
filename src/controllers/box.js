import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import debug from '../utils/debug'
import util from '../utils/util'
import { OPEN_BOX } from '../utils/const'
import Sequelize from 'sequelize'
import statisMgr from '../common/statisMgr'
const Op = Sequelize.Op
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

        let boxGoods = await models.Box.findOne({
            include: [{
                model: models.Goods,
                attributes: ['id', 'img', 'name', 'skin_name', 'discrable', 'goods_qualities_id'],
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
        let goodsIds = []
        for (let i in boxGoods.Goods) {
            goodsIds.push(boxGoods.Goods[i].goods_qualities_id)
        }
        const goodsQualities = await models.GoodsQualities.findAll({
            attributes: ['id', 'img'],
            where: {
                id: {
                    [Op.in]: goodsIds
                }
            }
        })
        let qualitiesMapGoodsId = {}
        for (let i in goodsQualities) {
            qualitiesMapGoodsId[goodsQualities[i].id] = goodsQualities[i].img
        }
        for (let i in boxGoods.Goods) {
            boxGoods.Goods[i].setDataValue('qualities_img', qualitiesMapGoodsId[boxGoods.Goods[i].goods_qualities_id])
        }
        return Promise.resolve(boxGoods)
    } catch (err) {
        return Promise.reject(err.message)
    }
}

export default {
    getBox
}