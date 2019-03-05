import Router from 'koa-router'
import game from '../controllers/game'
import { wrapRoute } from '../utils/wrapRoute'
const router = Router({
    prefix: '/game'
})

router.get('/', wrapRoute(game.gameList))
router.get('/boxlist', wrapRoute(game.getGameBoxList))

module.exports = router