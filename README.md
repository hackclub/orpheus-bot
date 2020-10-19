![](https://raw.githubusercontent.com/hackclub/dinosaurs/master/club_dinosaur.png)

- [Commands](#commands)
  - [Slash Commands](#slash-commands)
    - [Anyone](#anyone)
    - [Full Slack Users](#full-slack-users)
    - [Club leaders](#club-leaders)
    - [Slack Owner/Admin](#slack-owneradmin)
  - [Message commands](#message-commands)
    - [Anyone](#anyone-1)
    - [Club leaders](#club-leaders-1)
    - [Slack Owner/Admin](#slack-owneradmin-1)
- [Misc Interactions](#misc-interactions)

## Commands
### Slash Commands
_Every Slash command comes with a help message. For example, to learn to use `/stats`, type `/stats help` in Slack._

‡ = anyone  
§ = full Slack user only (not multi-channel or single-channel guest)  
Δ = club leader only  
◊ = Slack owner/admin only  
**†** = deprecated  

#### Anyone
- ‡`/airtable` Post the database links of a Slack user
- ‡`/address` `/leader-address` Post the current user's address with a link to edit
- ‡`/stats @USER` Get tagged user's meeting stats
- ‡`/stats #CHANNEL` Get tagged channel's meeting stats
- ‡`/get` `/promo` See a list of available promotions
  - ‡`/get notion premium` Get a Premium Notion account
  - ‡`/get adafruit discount` Get a discount code for Adafruit
- **†** ‡`/som-report` Report a Slack user's behavior

#### Full Slack Users
_This doesn't include Slack guests, such as multi-channel or single-channel users_

- §`/som-lookup` Lookup who promoted a multi-channel guest to a full Slack user during the Summer of Making.
- **†** §`/som-invite` Invite a multi-channel guest for the Summer of Making.

#### Club leaders
- Δ`/club-address` Post the current user's club address with a link to edit
- Δ`/rename-channel` Rename your club channel
- Δ`/meeting-add` Add a meeting to your club's stats
- Δ`/meeting-remove` Remove a mis-recorded meeting
- Δ`/meeting-list` Get a list of club meetings (useful for /meeting-remove)
- Δ`/meeting-stats` `/stats` Get current user's meeting stats
  - ‡`/stats @USER` Get tagged user's meeting stats
  - ‡`/stats #CHANNEL` Get tagged channel's meeting stats
- Δ`/orpheus-tutorial` `/meeting-tutorial`
  - Use `@orpheus forget` before running the command to restart the tutorial from scratch
- Δ`/leader-add @USER` Add another Slack user as a leader for your club
- Δ`/leader-list` Print out the Slack accounts of registered co-leads
- ‡`/get` `/promo` See a list of available promotions
  - Δ`/get zoom pro` Upgrade to a Zoom Pro account
  - Δ`/get hack pack` Add club to list of Hack Pack approved clubs
  - Δ`/get sticker envelope` Order a sticker envelope for yourself or another slack user
  - Δ`/get stickermule` Request credit on StickerMule
  - **†** Δ`/get github grant` Request a $100 grant for your club, paid by GitHub
- **†** Δ`/club-card` Issue a credit card number for your club
- **†** Δ`/meeting-time` Set the meeting time to get meeting notifications weekly

#### Slack Owner/Admin
- ◊`/announcement` Send an announcement to all clubs in Airtable queued for announcements
  - ◊`/announcement address` See a list of the enqueued clubs
  - ◊`/announcement status` Get the number of successful messages sent / the total messages to send
  - ◊`/announcement send` Start sending announcements to enqueued clubs
  - ◊`/announcement record` Record a Slack message to the announcement buffer
- ◊`/som-promote @USER` Promote a multi-channel guest to a full Slack user.
- **†** ◊`/som-ban` Deactivate a Slack user

### Message commands

‡ = anyone  
Δ = club leader only  
◊ = Slack owner/admin only  
**†** = deprecated  

#### Anyone
- ‡`@orpheus breakout` creates an ephemeral channel based on the current channel
- ‡`@orpheus info` Print the current uptime (used as a startup message)
- ‡`@orpheus forget` _(Deprecated)_ Deletes a Slack user from @orpheus' memory. Used for debugging.
- ‡`@orpheus find or create @USER` Finds or creates a user record in the Airtable database. Used by automations.
- **†** ‡`@orpheus date` _(Deprecated)_ Command that returns a parsed date. Used for debugging.

#### Club leaders
- **†** Δ`@orpheus checkin` _(Deprecated, Club leader only)_ Start a check-in with the current user

#### Slack Owner/Admin
- ◊`thump` _(Admin only)_ Trigger scheduled tasks (ex. close inactive breakout channels)
- ◊`@orpheus dm` _(Admin only)_ Send a message as @orpheus
  - `@orpheus dm @USER Hello world` Send a DM to @USER of "Hello world"
  - `@orpheus dm #CHANNEL Hello world` Send a DM to #CHANNEL of "Hello world"
- ◊`@orpheus add this team to the leaders channel` Use in a club channel to invite all associated leader to the private `#leaders` channel

## Misc Interactions

- Posting files in the `#cdn` channel will [host them on a cdn link](/src/interactions/fileShare.js)
- Mentioning `@orpheus` in a message that contains `thanks/thank you/thnx` etc. will trigger a response
- Mentioning `hacktoberfest` in a message will trigger an ephemeral response to the user (but only in Oct)
- Mentioning `@orpheus` in a message that contains `hello` will trigger a response
- Asking `what are you doing` in a message `@orpheus` is tagged in will trigger a response
- Tagging `@orpheus` in a message that doesn't map to an existing interaction will trigger a confused response