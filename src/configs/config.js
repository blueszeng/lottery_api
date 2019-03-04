const _ = require('lodash')
const development = require('./development')
const production = require('./production')
const cst = require('./const')
const alipayPay = require('./alipayPay')

const env = process.env.NODE_ENV || 'development'
const configs = {
    development: development,
    production: production,
}
const defaultConfig = {
    cst: cst,
    env: env,
    alipayPay: alipayPay,
    salt: 'zengyong',
    wechatAppid: 'wx1f58a987a5619fb6',
    wechatSecret: '263ecc320579be8c52c1fa7f000f4c5b',
    wechatMchid: '1346625101',
    wechatPayApiKey: 'deerwarwechat1234567891011121314',
    wechatNotifyUrl: 'http://wechat.deerwar.com/api/common/wechat/pay',
    qqAppid: 'ID1108166739',
    qqApiKey: 'LKQ8wMCUYqaUDaLG',
    QQRedirect_uri: "http://localhost://2332xx.xx.xx",
}

const config = _.merge(defaultConfig, configs[env])
module.exports = config