import models from '../models/index'
import { Joi, validate } from '../utils/validator'
import util from '../utils/util'
import { createQrderPay } from '../services/alipay/api'



const getPayInfo = async(ctx, next) => {
    try {
        return Promise.resolve({
            rate: 7.1
        })
    } catch (err) {
        return Promise.reject(`getPayInfo${err.message}`)
    }
}


/**
 * 生成支付宝二维码
 */
const alipayCreateOrder = async(ctx, next) => {
    try {
        const validateSchema = Joi.object().keys({
            money: Joi.number().integer().min(20).required(10000).label('人民币金额'),
            dollar_money: Joi.number().integer().min(3).max(1000).required().label('美元金额')
        })
        body = await validate(ctx.request.body, validateSchema)
        const userId = ctx.state.userId
        const data = {
            userId: userId,
            sdcustomno: util.generateOrderNo(),
            money: body.money,
            dollar_money: dollar_money,
            state: 0
        }

        let ret = await createQrderPay({
            tradeNo: data.sdcustomno,
            money: data.money,
            subject: 'sssWEWE',
            body: '充值哈哈'
        })
        await models.Order.create(data)
        return Promise.resolve({
            qrCode: ret.qr_code
        })
    } catch (err) {
        return Promise.reject(`生成订单失败${err.message}`)
    }
}


/**
 * 支付宝回调
 */
const alipayPayNotify = async(ctx, next) => {
    const body = ctx.request.body
    const signStatus = alipay_f2f.verifyCallback(body);
    if (signStatus === false) {
        return Promise.reject('回调签名验证未通过')
    }

    const noInvoice = body['out_trade_no'] // 商户订单号 
    const invoiceStatus = body['trade_status'] //  订单状态

    if (invoiceStatus !== 'TRADE_SUCCESS') {
        return Promise.resolve('success')
    }
    let order = await models.Order.findOne({ sdcustomno: noInvoice })
    if (order) {
        order.update({
            state: 1 // 支付完成
        })
        await order.save()
    }

}


export default {
    alipayPayNotify,
    getPayInfo,
    alipayCreateOrder
}