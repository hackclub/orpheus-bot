import { transcript, initBot } from '../utils'
//import * as githubGrant from './promos/githubGrant'
import * as hackPack from './promos/hackPack'
import * as stickerEnvelope from './promos/stickerEnvelope'
// import * as notionPremium from './promos/notionPremium'
import * as stickermule from './promos/stickermule'
import * as adafruitDiscount from './promos/adafruitDiscount'
import * as zoom from './promos/zoom'
import * as replitHackerPlan from './promos/replitHackerPlan'

const promos = [
  stickerEnvelope,
  // notionPremium,
  stickermule,
  hackPack,
  //githubGrant,
  replitHackerPlan,
  adafruitDiscount,
  zoom,
]

const interactionGet = async (bot = initBot(), message) => {
  const args = message.text.toLowerCase()

  if (args == 'help') {
    await bot.replyPrivateDelayed(message, transcript('get.help'))
    return
  }

  const selectedPromo = promos.find(promo => {
    const promoMatchers = promo.names.map(t => t.toLowerCase())

    return promoMatchers.find(matcher => args.indexOf(matcher) === 0)
  })

  if (selectedPromo) {
    try {
      await selectedPromo.run(bot, message)
    } catch (err) {
      console.error(err)
      await bot.replyPrivateDelayed(
        message,
        transcript('errors.general', { err })
      )
    }
  } else {
    await bot.replyPrivateDelayed(message, transcript('get.list', { promos }))
  }
}

export default interactionGet
