import config from '../configs/config'
import alipayf2f from 'alipay-ftof'

export const payment = new alipayf2f(config.alipayPay)