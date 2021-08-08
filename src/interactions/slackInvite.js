import { initBot, transcript, getInfoForUser } from "../utils";
import AirtablePlus from "airtable-plus";

const joinTable = new AirtablePlus({
  apiKey: process.env.AIRTABLE_KEY,
  baseID: "appaqcJtn33vb59Au",
  tableName: "Join Requests",
});

export default async function interactionRename(bot, message) {
  const { user, channel } = message;

  getInfoForUser(user).then(async ({ leader, club, userRecord }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`);
      bot.replyPrivateDelayed(message, transcript("slackInvite.invalidUser"));
      return;
    }

    if (!club) {
      console.log(`${user} didn't run this in a club channel`);
      bot.replyPrivateDelayed(message, transcript("slackInvite.noClubChannel"));
      return;
    }

    if (club.fields["Slack Channel ID"] != channel) {
      console.log(
        `${channel} isn't ${user}'s channel, so I asked them to run it there`
      );
      bot.replyPrivateDelayed(
        message,
        transcript("slackInvite.invalidChannel", {
          channel: club.fields["Slack Channel ID"],
        })
      );
      return;
    }
    const recipientID = message.text.toLowerCase();
    const emailRegex = /mailto:(.+)\|/;
    if (emailRegex.test(recipientID)) {
      console.log("I think this is an email, sending an invite!");
      email = recipientID.match(emailRegex)[1];
      await joinTable.create({
        "Full Name": "Club Member Joining",
        "Email Address": email,
        Student: true,
        Reason: `Joining from <#${club.fields["Slack Channel ID"]}>!`,
        Invited: true,
        Club: club.fields["Slack Channel ID"],
      });

      // This is a private api method found in https://github.com/ErikKalkoken/slackApiDoc/blob/master/users.admin.invite.md
      // I only got a successful response by putting all the args in URL params
      // Giving JSON body DID NOT WORK when testing locally
      // —@MaxWofford

      const params = [
        `email=${email}`,
        `token=${process.env.SLACK_LEGACY_TOKEN}`,
        `real_name=${email.split("@")[0]}`,
        "restricted=true",
        `channels=C74HZS5A5`,
        "resend=true",
      ].join("&");
      const url = `https://slack.com/api/users.admin.invite?${params}`;
      await fetch(url, { method: "POST" })
        .then((r) => r.json())
        .then((r) => console.log("Slack response", r));
      await bot.replyPrivateDelayed(
        message,
        transcript("slackInvite.invited", {
          email: email,
        })
      );
    } else {
      bot.replyPrivateDelayed(
        message,
        transcript("slackInvite.instructions", {
          channel: club.fields["Slack Channel ID"],
        })
      );
    }
  });
};