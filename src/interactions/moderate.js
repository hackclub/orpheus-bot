import { transcript, getInfoForUser, airPatch } from "../utils";

const interactionModerate = async (bot, message) => {
  const { user, channel } = message;

  if (message.text === "help") {
    console.log(`I responded to ${user} with a help message`);
    bot.replyPrivateDelayed(message, transcript("moderate.help")); // Needs updating
    return;
  }

  getInfoForUser(user).then(async ({ leader, club, userRecord }) => {
    if (!leader) {
      console.log(`${user} isn't a leader, so I told them this was restricted`);
      bot.replyPrivateDelayed(message, transcript("moderate.invalidUser"));
      return;
    }

    if (!club.fields["Linked Community Channel"]) {
      console.log(
        `Here we will link them up as they don't have a linked channel`
      );
      await airPatch("Clubs", club.id, {
        "Linked Community Channel": channel,
      });
      bot.replyPrivateDelayed(
        message,
        transcript("moderate.linked", {
          channel: message.channel,
        })
      );
      return;
    }

    if (!message.text.includes("https://hackclub.slack.com/archives/")) {
      console.log(`This doesn't seem to be a Slack link`);
      bot.replyPrivateDelayed(message, transcript("moderate.invalidLink"));
      return;
    }

    if (!message.text.includes(club.fields["Linked Community Channel"])) {
      console.log(`This doesn't seem to be in this channel`);
      bot.replyPrivateDelayed(message, transcript("moderate.notInChannel"));
      return;
    }

    const messageTS = message.text
      .toLowerCase()
      .trim()
      .split(`${club.fields["Linked Community Channel"].toLowerCase().trim()}/p`)[1];
    try {
      const deleting = await bot.api.chat.delete({
        channel: club.fields["Linked Community Channel"],
        ts: messageTS,
      }, err => console.error(err));
      console.log(deleting)
      console.log(message.text
      .toLowerCase().trim().split(`${club.fields["Linked Community Channel"]}/p`))
      console.log(messageTS)
      bot.replyPrivateDelayed(message, transcript("moderate.success"));
    } catch (err) {
      bot.replyPrivateDelayed(message, transcript("moderate.error", { err }));
    }
  });
};
export default interactionModerate;
