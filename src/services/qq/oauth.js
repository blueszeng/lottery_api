import http from '../../utils/http'
import config from '../../configs/config'
const URL = config.cst.URL

import _debug from '../../utils/debug'

const log = _debug(__filename)
    /**
     * [async 根据qq oauth授权回调后的code换取access_token以及openid]
     * @param  {[String]} code [微信oauth授权回调后的code]
     * @return {[Promise]}      [微信用户在本公众号的openid]
     */

const getOpenid = async(code) => {

    try {
        let args = {
            grant_type: 'authorization_code',
            client_id: config.qqAppid,
            client_secret: config.qqApiKey,
            redirect_uri: config.QQRedirect_uri,
            code: code
        }
        let ret = await http.get(URL.QQ_Get_Access_Token, args) // 获取access_token
        args = {
            access_token: 'authorization_code',
        }
        ret = await http.get(URL.QQ_Get_OpenID, args) // 获取openid
        return Promise.resolve(ret.openid)
    } catch (err) {
        return Promise.reject(`获取openId${err.message}`)
    }
}

/**
 * [async 根据用户openid获取用户QQ的基本信息]
 * @param  {[type]} access_token [description]
 * @param  {[type]} openid [description]
 * @return {[type]}        [description]
 */
const getQQProfile = async(access_token, openid) => {
    let args = {
        access_token: access_token,
        openid: openid,
        oauth_consumer_key: config.qqApiKey,
    }
    try {
        let ret = await http.get(URL.QQ_Get_UserInfo, args)
        return Promise.resolve(ret)
    } catch (err) {
        return Promise.reject(`获取QQProfile${err.message}`)
    }
}

export default { getOpenid }