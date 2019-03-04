import Router from 'koa-router'
import game from '../controllers/game'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/game'
})

router.post('/', wrapRoute(game.gameList))
router.post('/boxlist', wrapRoute(game.getGameBoxList))

module.exports = router