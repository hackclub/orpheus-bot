export default async (bot, message) => {
  const { user, item } = message;
  const { channel, ts } = item;
  if (
    (channel != "C0P5NE354" /* #bot-spam */ &&
      channel != "C0266FRGT" /* #announcements */ &&
      channel != "C021TJA96UC" /* private-summer-channel */ &&
      (channel != "C0274DWBZQC" /* private-testing-channel */) || ts != "1626196839.245600")
  ) {
    return
  }
  await bot.say({
    channel: user,
    text: transcript("wildWildWest.ticket", { user }),
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: transcript("wildWildWest.ticket", { user }),
        },
      },
      {
        type: "image",
        image_url: transcript("wildWildWest.image", { user }),
        alt_text: "Your ticket",
      },
    ],
  });
}