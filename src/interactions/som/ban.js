import fetch from 'isomorphic-unfetch'
const { initBot, transcript } = require("../../utils");

const interactionSOMBan = async (bot = initBot(), message) => {
  const taggedUserID = (message.text.match(/<@([a-zA-Z0-9]*)|/) || [])[1]
  console.log('ban tagged user id', taggedUserID)
  if (!taggedUserID) {
    console.log('ban: no tagged user')
    return // do something if we don't tag a user
  }
  const admin = await isAdmin(bot, message.user)
  if (!admin) {
    console.log('not admin!')
    bot.replyPrivate(message, transcript('som.ban.notAdmin'))
  }
  else {
    console.log('deactivating ', taggedUserID)
    await Promise.all([
      fetch(`https://slack.com/api/users.admin.setInactive?token=${process.env.SLACK_LEGACY_TOKEN}&user=${taggedUserID}`).then(r => r.json()),
      bot.replyPrivateDelayed(message, transcript('som.ban.deactivated', { user: taggedUserID }))
    ])
  }
}
export default interactionSOMBan

const isAdmin = (bot, user) =>
  new Promise((resolve, reject) => {
    bot.api.users.info({ user }, (err, res) => {
      if (err) {
        console.error(err)
        reject(err)
      }
      resolve(res.user.is_admin)
    })
  })