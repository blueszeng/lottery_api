let newMsg = [] //开宝箱新数量
let oldMsg = [] // 开宝箱旧数据
let statistics = {
    openBoxNum: 0, //打开宝箱数量
    online: 0, // 在线人数
    userNum: 0 // 总用户数
}

const MAX_OLD_LEN = 50 // 最多缓存多少条旧宝箱数据

/**
 * 初始化统计数据
 */
const initStatis = async(models) => {
    let openBoxNum = await models.WinPrizePush.count({
        where: { type: 1 }
    })
    statistics.openBoxNum = openBoxNum
    let userNum = await models.User.count({})
    statistics.userNum = userNum
}

/**
 * 添加抽奖奖品记录
 */
const addBoxAwardMsg = (msgs) => {
    newMsg = newMsg.concat(msgs)
}

/**
 *  登陆获取宝箱抽奖奖品记录
 */
const getLoginBoxAwardMsg = () => {
    return oldMsg.slice(0, 20)
}

/**
 * 设置用户在线数量
 */
const setUserNum = (num, isSet = false) => {
    if (isSet === true) {
        statistics.userNum = num
        return
    }
    statistics.userNum++
}

/**
 * 设置用户打开宝箱数量
 */
const setOpenBoxNum = (num, isSet = false) => {
    if (isSet === true) {
        statistics.openBoxNum = num
        return
    }
    statistics.openBoxNum++
}


const saveBoxAwardToOldMsg = (msgs) => {
    for (var i in msgs) {
        if (oldMsg.length >= MAX_OLD_LEN) {
            oldMsg.unshift(msgs[i])
            oldMsg.pop()
            continue
        }
        oldMsg.push(msgs[i])
    }
}

const pushMsgToClient = () => {
    if (global.io && global.io.sockets) {
        if (newMsg.length > 0) { // 推送中奖消息
            let data = JSON.stringify(newMsg)
            saveBoxAwardToOldMsg(newMsg)
            newMsg = []
            global.io.sockets.emit("award_push", data)
        }
        statistics.online = global.io.eio.clientsCount //设置在线用户数量
        global.io.sockets.emit("statistics_push", JSON.stringify(statistics))
    }
}

// 5秒钟向客户端推送一次消息
setInterval(pushMsgToClient, 5000)

export default {
    initStatis,
    addBoxAwardMsg,
    getLoginBoxAwardMsg,
    setUserNum,
    setOpenBoxNum
}