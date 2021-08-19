export default async (bot, message) => {
  const { user, item } = message;
  const { channel, ts } = item;

  if (channel != "C0266FRGT" /* #announcements */ ||   ts != "1626196839.245600") {
    return
  }

  await fetch(`https://games.hackclub.dev/api/sign-up?username=${user}`)
  await bot.say({
    channel: user,
    text: transcript("olympics.ticket", { user }),
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: transcript("olympics.ticket", { user }),
        },
      }
    ],
  });
}