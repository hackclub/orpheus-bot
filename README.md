![](https://raw.githubusercontent.com/hackclub/dinosaurs/master/club_dinosaur.png)

- [Commands](#commands)
  - [Legend](#legend)
  - [Slash Commands](#slash-commands)
    - [Anyone ‡](#anyone-)
    - [Full Slack Users §](#full-slack-users-)
    - [Club leaders Δ](#club-leaders-δ)
    - [Slack Owner/Admin ◊](#slack-owneradmin-)
  - [Message commands](#message-commands)
    - [Anyone ‡](#anyone--1)
    - [Club leaders Δ](#club-leaders-δ-1)
    - [Slack Owner/Admin ◊](#slack-owneradmin--1)
- [Misc Interactions](#misc-interactions)

## Commands

### Legend

‡ = anyone  
§ = full Slack user only (not multi-channel or single-channel guest)  
Δ = club leader only  
◊ = Slack owner/admin only  
**†** = deprecated

### Slash Commands

_Every Slash command comes with a help message. For example, to learn to use `/stats`, type `/stats help` in Slack._

#### Anyone ‡

- ‡[`/airtable`](/src/interactions/airtable.js) Post the database links of a Slack user
- ‡[`/address` `/leader-address`](src/interactions/address.js) Post the current user's address with a link to edit
- **†** ‡[`/stats @USER`](/src/interactions/stats.js) Get tagged user's meeting stats
- **†** ‡[`/stats #CHANNEL`](/src/interactions/stats.js) Get tagged channel's meeting stats
- **†** ‡[`/get`](/src/interactions/get.js) See a list of available promotions
  - **†** ‡[`/get notion premium`](src/interactions/promos/notionPremium.js) Get a Premium Notion account
  - **†** ‡[`/get adafruit discount`](src/interactions/promos/adafruitDiscount.js) Get a discount code for Adafruit
- **†** ‡`/report` File a misconduct report
- **†** ‡`/som-report` Report a Slack user's behavior
- **†** ‡[`/promo`](src/interactions/promo.js) Renamed to `/get`

_‡ = anyone_  
_**†** = deprecated_

#### Full Slack Users §

_This excludes Slack guests, such as multi-channel or single-channel users._

- **†** §[`/som-lookup`](src/interactions/som/lookup.js) Lookup who promoted a multi-channel guest to a full Slack user during the Summer of Making.
- **†** §`/som-invite` Invite a multi-channel guest for the Summer of Making.
- **†** §[`/club-init`](src/interactions/clubInit.js) Become a club leader by creating a club

_§ = full Slack user only (not multi-channel or single-channel guest)_  
_**†** = deprecated_

#### Club leaders Δ

- **†** Δ[`/club-address`](src/interactions/clubAddress.js) Post the current user's club address with a link to edit
- **†** Δ[`/rename-channel`](src/interactions/rename.js) Rename your club channel
- **†** Δ[`/slack-invite`](src/interactions/slack-invite.js) Get custom club Slack invite link & optionally invite an email to Slack
- **†** Δ[`/moderate`](src/interactions/moderate.js) Use this command to moderate your club's community channel, first run `/moderate` to link the channel and then `/moderate <slack message link>` to delete an inappropriate message. WIP.
- **†** Δ[`/meeting-add`](src/interactions/meetingAdd.js) Add a meeting to your club's stats
- **†** Δ[`/meeting-remove`](src/interactions/meetingRemove.js) Remove a mis-recorded meeting
- **†** Δ[`/meeting-list`](src/interactions/meetingList.js) Get a list of club meetings (useful for /meeting-remove)
- **†** Δ[`/meeting-stats` `/stats`](src/interactions/stats.js) Get current user's meeting stats
  - **†** ‡[`/stats @USER`](src/interactions/stats.js) Get tagged user's meeting stats
  - **†** [`/stats #CHANNEL`](src/interactions/stats.js) Get tagged channel's meeting stats
- **†** Δ[`/orpheus-tutorial` `/meeting-tutorial`](src/interactions/tutorial.js)
  - Use `@orpheus forget` before running the command to restart the tutorial from scratch
- **†** Δ[`/leader-add @USER`](src/interactions/leaderAdd.js) Add another Slack user as a leader for your club
- **†** Δ[`/leader-list`](src/interactions/leaderList.js) Print out the Slack accounts of registered co-leads
- **†** ‡[`/get`](src/interactions/get.js) See a list of available promotions
  - **†** Δ[`/get zoom pro`](src/interactions/promos/zoom.js) Upgrade to a Zoom Pro account. Deprecated in favor of https://github.com/hackclub/slash-z
  - **†** Δ[`/get hack pack`](src/interactions/promos/hackPack.js) Add club to list of Hack Pack approved clubs
  - **†** Δ[`/get sticker envelope`](src/interactions/promos/stickerEnvelope.js) Order a sticker envelope for yourself or another slack user
  - **†** Δ[`/get stickermule`](src/interactions/promos/stickermule.js) Request credit on StickerMule
  - **†** Δ[`/get github grant`](src/interactions/promos/githubGrant.js) Request a $100 grant for your club, paid by GitHub
- **†** Δ[`/club-card`](src/interactions/clubCard.js) Issue a credit card number for your club
- **†** Δ[`/meeting-time`](src/interactions/meetingTime.js) Set the meeting time to get meeting notifications weekly

_Δ = club leader only_  
_‡ = anyone_  
_**†** = deprecated_

#### Slack Owner/Admin ◊

- **†** ◊[`/announcement`](src/interactions/announcement.js) Send an announcement to all clubs in Airtable queued for announcements
  - **†** ◊[`/announcement address`](src/interactions/announcement.js) See a list of the enqueued clubs
  - **†** ◊[`/announcement status`](src/interactions/announcement.js) Get the number of successful messages sent / the total messages to send
  - **†** ◊[`/announcement send`](src/interactions/announcement.js) Start sending announcements to enqueued clubs
  - **†** ◊[`/announcement record`](src/interactions/announcement.js) Record a Slack message to the announcement buffer
- **†** ◊[`/som-promote @USER`](src/interactions/som/promote.js) Promote a multi-channel guest to a full Slack user.
- **†** ◊`/som-ban` Deactivate a Slack user

_Δ = club leader only_  
_**†** = deprecated_

### Message commands

#### Anyone ‡

- ‡[`@orpheus breakout`](src/interactions/breakout.js) creates an ephemeral channel based on the current channel
- ‡[`@orpheus info`](src/interactions/info.js) Print the current uptime (used as a [startup message](src/interactions/startup.js))
- ‡[`@orpheus forget`](src/interactions/forget.js) Deletes a Slack user from @orpheus' memory. Used for debugging.
- ‡[`@orpheus find or create @USER`](src/interactions/findOrCreate.js) Finds or creates a user record in the Airtable database. Used by automations.
- ‡[`@orpheus date`](src/interactions/date.js) Command that returns a parsed date. Used for debugging.

_‡ = anyone_

#### Club leaders Δ

- **†** Δ[`@orpheus checkin`](src/interactions/checkin.js) Start a check-in with the current user

_Δ = club leader only_  
_**†** = deprecated_

#### Slack Owner/Admin ◊

- ◊[`thump`](src/interactions/trigger/index.js) Trigger scheduled tasks (ex. close inactive breakout channels)
- ◊[`@orpheus dm`](src/interactions/dm.js) Send a message as @orpheus
  - ◊[`@orpheus dm @USER Hello world`](src/interactions/dm.js) Send a DM to @USER of "Hello world"
  - ◊[`@orpheus dm #CHANNEL Hello world`](src/interactions/dm.js) Send a DM to #CHANNEL of "Hello world"
- ◊[`@orpheus add this team to the leaders channel`](src/interactions/leaderInvite.js) Use in a club channel to invite all associated leader to the private `#leaders` channel

_◊ = Slack owner/admin only_

## Misc Interactions

- Posting files in the `#cdn` channel will [host them on a cdn link](/src/interactions/fileShare.js)
- Mentioning `@orpheus` in a message that contains `thanks/thank you/thnx` etc. will trigger a response
- Mentioning `@orpheus` in a message that contains `who are you` etc. will trigger a response
- Mentioning `@orpheus` in a message that contains `where are you` etc. will trigger a response
- Mentioning `@orpheus` in a message that contains `what are you doing` etc. causes orpheus to shrug
- Mentioning `hacktoberfest` in a message will trigger an [ephemeral response to the user](src/interactions/hacktoberfest.js) (but only in Oct)
- Mentioning `@orpheus` in a message that contains `hello` will [trigger a response](src/interactions/hello.js)
- Mentioning `@orpheus` in a message that contains `sass` or `mock` will [trigger a sassy response](src/interactions/mocking.js)
- Asking `what are you doing` in a message `@orpheus` is tagged in will trigger a response
- Tagging `@orpheus` in a message that doesn't map to an existing interaction will [trigger a confused response](src/interactions/catchall.js)
- The phrase `get a room` in a post or thread will [trigger the breakout commmand](src/interactions/breakout.js)
