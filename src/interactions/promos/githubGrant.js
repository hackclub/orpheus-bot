import { initBot, getInfoForUser, airFind, airCreate, transcript } from '../../utils'
import interactionMailMission from '../mailMission'

/*
to test
[ ] mailteam request vanilla grant
[ ] mailteam request recurring grant (valid)
[ ] mailteam request recurring grant (already had grant this semester)
[ ] hcb request vanilla grant
[ ] hcb request recurring grant (valid)
[ ] hcb request recurring grant (already had grant this semester)
[ ] request from non leader
*/
export const names = ['GitHub Grant', 'club grant']
export const details =
  'Available to club leaders. Must have a meeting time set with `/meeting-time`'

export async function run(bot, message) {
  const { user } = message
  const { leader, club } = await getInfoForUser(user)

  if (!leader || !club) {
    await bot.replyPrivateDelayed(
      message,
      transcript('promos.githubGrant.notAuthorized')
    )
    return
  }

  const lastGrant = await airFind('GitHub Grants', 'Club', club.fields['ID'], {
    selectBy: {
      sort: [{ field: 'Initiated at', direction: 'desc' }],
    },
  })
  if (!lastGrant) {
    // this is their first grant
    const grant = await airCreate('GitHub Grants', {
      Club: [club.id],
      Leader: [leader.id],
      Type: 'First meeting ($100)',
      'Grant amount': 100,
    })

    if (grant.fields['HCB Account']) {
      // if they have an HCB account, we'll notify the bank team
      await bot.replyPrivateDelayed(
        message,
        transcript('promos.githubGrant.hcbFulfillment', {
          hcbLink: grant.fields['HCB Account'],
        })
      )
    } else {
      // if no HCB account, we'll have to put in a mail mission
      await interactionMailMission(undefined, {
        user,
        text: 'new_club_grant',
      })
      await bot.replyPrivateDelayed(
        message,
        transcript('promos.githubGrant.updateShipping')
      )
    }
    return
  } else {
    // they've had a grant before
    const lastGrantDate = new Date(lastGrant.fields['Initiated at'])
    const today = new Date()

    // our heuristic for keeping 1 grant per semester is to check if the last grant was both this semester & this year
    // semesters are defined as:
    // - first semester months are 6 through 11
    // - second semester months are 0 through 5
    const currentSemester = Math.floor(today.getMonth() / 5)
    const lastGrantSemester = Math.floor(lastGrantDate.getMonth() / 5)

    const hasSameYear = lastGrantDate.getYear() == today.getYear()
    const hasSameSemester = lastGrantSemester == currentSemester
    if (hasSameYear && hasSameSemester) {
      const requester = (
        await airFind(
          'People',
          `RECORD_ID() = '${lastGrant.fields['Leader'][0]}'`
        )
      ).fields['Slack ID']
      await bot.replyPrivateDelayed(
        message,
        transcript('promos.githubGrant.alreadyGranted', {
          lastGrantDate,
          requester,
        })
      )
      return
    }

    await initBot().say({
      channel: 'U0C7B14Q3' // DM Max
      text: `I've just filed a grant request for <@${user}>. Might want to hop on a call with them.`
    })
  }
}
