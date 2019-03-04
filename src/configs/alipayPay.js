// config.js

module.exports = {

    /* 以下信息可以在https://openhome.alipay.com/platform/appManage.htm查到, 不过merchantPrivateKey需要您自己生成 */

    /* 应用AppID */
    "appid": 0,

    /* 通知URL 接受支付宝异步通知需要用到  */
    "notifyUrl": "",

    /* 公钥 和 私钥 的填写方式 */
    "testPrivateKey": "-----BEGIN RSA PRIVATE KEY-----\n" +
        "公钥或私钥内容..." +
        "\n-----END RSA PRIVATE KEY-----",

    /* 应用RSA私钥 请勿忘记 -----BEGIN RSA PRIVATE KEY----- 与 -----END RSA PRIVATE KEY-----  */
    "merchantPrivateKey": "",

    /* 支付宝公钥 如果为注释掉会使用沙盒公钥 请勿忘记 -----BEGIN PUBLIC KEY----- 与 -----END PUBLIC KEY----- */
    "alipayPublicKey": "",

    /* 支付宝支付网关 如果为注释掉会使用沙盒网关 */
    "gatewayUrl": "",
};