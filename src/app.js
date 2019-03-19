import path from 'path'
import Koa from './extendlib/koa.io' // extend socket.io 
import session from 'koa-generic-session'
import convert from 'koa-convert'
import json from 'koa-json'
import cors from 'koa2-cors'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import koaRedis from 'koa-redis'


import config from './configs/config'
import router from './routes'
import middlewares from './middlewares'
import crypto from './utils/crypto'
import ioRoute from './socket/routes'
import swagger from './swagger'

const redisStore = koaRedis({
    url: config.redisUrl
})
const app = new Koa()

app.use(cors({
    origin: function(ctx) {
        if (ctx.url === '/test') {
            return "*" // 允许来自所有域名请求
        }
        return '*'
    },
    exposeHeaders: ['X-Lottery-App-Token'],
    maxAge: 5,
    credentials: true,
    allowMethods: ['GET', 'POST', 'DELETE'],
    allowHeaders: ['Content-Type', 'Authorization', 'Accept'],
}))

app.keys = [config.secretKeyBase]
if (config.serveStatic) {
    app.use(convert(require('koa-static')(path.join(__dirname, './public/'))))
}

app.use(convert(session({
    store: redisStore,
    prefix: 'boss:sess:',
    key: 'boss.sid'
})))


swagger(app)

app.use(bodyParser())

app.use(convert(json()))
app.use(convert(logger()))
app.use(middlewares.logMiddleware)
app.use(middlewares.authMiddleware)
app.use(router.routes(), router.allowedMethods())
console.log('listen port:', config.port)
app.listen(config.port)

app.io.use(async function(ctx, next) {
    //on connect  
    // add decrypt , encrypt func
    ctx.decrypt = crypto.decryptCipher
    ctx.encrypt = crypto.encryptCipher
    await next()
})

ioRoute(app.io) // add socket route
global.io = app.io // 设置全局