import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import debug from '../utils/debug'
import util from '../utils/util'
import { OPEN_BOX } from '../utils/const'
import statisMgr from '../common/statisMgr'
import Sequelize from 'sequelize'
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
        let { price } = await models.Box.findOne({
            attributes: ['price'],
            where: { id: boxId, open: 1 }
        })

        let boxGoods = await models.Box.findOne({
            include: [{
                model: models.Goods,
                attributes: ['id', 'img', 'name', 'skin_name', 'discrable', 'goods_qualities_id'],
                through: {
                    attributes: ['drop_probability'],
                }
            }],
            attributes: ['price', 'name'],
            where: {
                id: boxId,
                open: 1
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
            boxGoods.Goods[i].setDataValue('drop_probability', boxGoods.Goods[i].BoxGoods.drop_probability)
            boxGoods.Goods[i].setDataValue('BoxGoods', undefined)
            boxGoods.Goods[i].setDataValue('qualities_img', qualitiesMapGoodsId[boxGoods.Goods[i].goods_qualities_id])
        }


        // boxGoods = await models.Box.count()
        const boxs = models.Box.findAll({
            // offset,
            // limit,
            // where,
            include: [{
                    model: models.Game,
                    attributes: ['id', 'name'],
                },
                {
                    model: models.BoxType,
                    attributes: ['id', 'name'],
                }
            ],
        })


        return Promise.resolve(boxs)
    } catch (err) {
        return Promise.reject(err.message)
    }
}

export default {
    getBox
}