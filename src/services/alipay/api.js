import { payment } from '../../stores/alipay_pay'

/**
 * 创建支付二維码
 */
export const createQrderPay = async(orderInfo) => {
    const result = await alipay_f2f.createQRPay({
            tradeNo: orderInfo.tradeNo,
            subject: orderInfo.subject,
            totalAmount: orderInfo.money,
            body: orderInfo.discrable,
            timeExpress: 5 //超时
        })
        // "code":"10000" ok   qr_code -  二维码
}