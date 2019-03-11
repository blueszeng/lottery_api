import jwt from 'jsonwebtoken'
import moment from 'moment'
import { transaction } from '../../utils/transaction'
import models from '../../models/index'
import lottery from '../../common/lottery'
import MysqlError from '../../utils/error/MysqlError'
import wechat from '../../services/wechat/oauth'
import qq from '../../services/qq/oauth'
const SECRETKEY = "23233"
const createToken = (userId, userAgent, days) => {
    return jwt.sign({
        userId,
        userAgent,
        days,
        renewTime: moment().add(1, 'h').unix()
    }, SECRETKEY, {
        expiresIn: `${days}d`
    })
}




const registerQQ = async(openid, profile) => {
    // 开始保存事务
    await transaction(async(t) => {
        let user = await models.User.create({ head: profile.figureurl_qq, name: profile.nickname, dollar_money: 0, exchange_money: 0 }, { transaction: t })
        const userId = user.id
        await models.QQstrategy.create({ uid: userId, openid: openid }, { transaction: t })
        return Promise.resolve({
            id: user.id,
            head: user.head,
            name: user.name,
            dollar_money: user.dollar_money,
            exchange_money: user.exchange_money,
        })
    })
}


/**
 * [async 根据微信oauth授权回调的code换取用户openid，判断用户是否已在系统中，已经存在直接返回用户信息对象，否则创建用户的微信认证策略以及调用微信api获取用户的头像，昵称等资料保存并返回用户信息对象]
 * @param  {[String]} code [微信oauth授权回调的code]
 * @return {[Object]}      [用户基本信息对象]
 */
const loginOrRegisterWechat = async(openid) => {
    const wechatProfile = await wechat.getUserWechatProfile(openid)
    let user = null
    if (wechatProfile.unionid) {
        user = await models.Wechatstrategy.findOne({ where: { unionid: wechatProfile.unionid } })
    } else {
        user = await models.Wechatstrategy.findOne({ where: { openid: openid } })
    }
    if (!user) {
        user = await registerWechat(openid)
    }
    let lotteryInfo = await lottery.getLotteryInfo()
    lotteryInfo.user = user
    return Promise.resolve(lotteryInfo)
}

const loginOrRegisterQQ = async(access_token, openid) => {
    const qqProfile = await qq.getQQProfile(access_token, openid)
    let user = await models.QQstrategy.findOne({ where: { openid: openid } })
    if (!user) {
        user = await registerQQ(openid, qqProfile)
    }
    return Promise.resolve(user)
}

export {
    createToken,
    loginOrRegisterWechat,
    loginOrRegisterQQ
}