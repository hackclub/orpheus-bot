process.env.STARTUP_TIME = Date.now();
import bugsnag from "@bugsnag/js";

import controller, { initBot } from "./controller";
import { reaction, transcript } from "./utils";

import interactionCheckin from "./interactions/checkin";
import interactionDate from "./interactions/date";
import interactionInfo from "./interactions/info";
import interactionStats from "./interactions/stats";
import interactionHello from "./interactions/hello";
import interactionTrigger from "./interactions/trigger";
// import interactionRename from "./interactions/rename";
// import interactionSlackInvite from "./interactions/slackInvite";
// import interactionLeaderAdd from "./interactions/leaderAdd";
// import interactionLeaderList from "./interactions/leaderList";
// import interactionMeetingList from "./interactions/meetingList";
// import interactionMeetingAdd from "./interactions/meetingAdd";
// import interactionMeetingRemove from "./interactions/meetingRemove";
// import interactionMeetingTime from "./interactions/meetingTime";
// import interactionTutorial from "./interactions/tutorial";
import interactionCatchall from "./interactions/catchall";
import interactionMocking from "./interactions/mocking";
// import interactionPromo from "./interactions/promo";
// import interactionGet from "./interactions/get";
// import interactionModerate from "./interactions/moderate";
// import interactionAnnouncement from "./interactions/announcement";
import interactionHacktoberfest from "./interactions/hacktoberfest";
import interactionLeaderInvite from "./interactions/leaderInvite";
import interactionAddress from "./interactions/address";
// import interactionClubAddress from "./interactions/clubAddress";
import interactionDM from "./interactions/dm";
import interactionGPT from "./interactions/gpt";
import interactionStartup from "./interactions/startup";
// import interactionWordcloud from "./interactions/wordcloud";
// import interactionReport from "./interactions/report";
import interactionForget from "./interactions/forget";
import interactionAirtable from "./interactions/airtable";
import interactionRoll from "./interactions/roll";
import interactionCheckinNotification from "./interactions/checkinNotification";
import interactionCheckinReply from "./interactions/checkinReply";
// import interactionClubCard from "./interactions/clubCard";
import interactionFindOrCreate from "./interactions/findOrCreate";
import interactionDocumentation from "./interactions/documentation";
import interactionWildWildWest from "./interactions/wildWildWest";
import interactionOlympics from "./interactions/olympics";
// import interactionGamelab from "./interactions/gamelab";

import interactionBreakout from "./interactions/breakout";
import interactionBreakoutUpdate from "./interactions/trigger/updateBreakouts";

import interactionFileShare from "./interactions/fileShare";

// import interactionSOMPromote from "./interactions/som/promote.js";
// import interactionSOMLookup from "./interactions/som/lookup";
// import interactionClubInit from "./interactions/clubInit";
import interactionReportForm from "./interactions/reportForm";
import interactionReportFormSubmit from "./interactions/reportFormSubmit";
import interactionEmail from "./interactions/email";
import interactionHaiku from "./interactions/haiku";
import interactionCSS from "./interactions/css";

export const bugsnagClient = bugsnag(process.env.BUGSNAG_API_KEY);

controller.hears(
  "checkin notification",
  "direct_message,direct_mention",
  async (bot, message) => {
    await reaction(bot, "add", message.channel, message.ts, "beachball");
    await interactionCheckinNotification(undefined, { user: message.user });
    await Promise.all([
      reaction(bot, "remove", message.channel, message.ts, "beachball"),
      reaction(bot, "add", message.channel, message.ts, "thumbsup-dino"),
    ]);
  }
);

controller.hears(
  "checkin",
  "direct_message,direct_mention",
  async (bot, message) => {
    await reaction(bot, "add", message.channel, message.ts, "beachball");
    await interactionCheckin(bot, message);
    await Promise.all([
      reaction(bot, "remove", message.channel, message.ts, "beachball"),
      reaction(bot, "add", message.channel, message.ts, "thumbsup-dino"),
    ]);
  }
);

controller.hears("thump", "ambient", interactionTrigger);
controller.hears(
  "update breakouts",
  "direct_mention",
  interactionBreakoutUpdate
);

if (process.env.OPENAI_API_KEY) {
// temporarily gate this to only run when the key is set
controller.hears(
  ["Orpheus", "orpheus", "OrpheusGPT", "orpheusgpt", "Orpheusgpt"],
  "direct_message,indirect_mention,direct_mention",
  interactionGPT
);
}

controller.hears("info", "direct_message,direct_mention", interactionInfo);

controller.hears("hacktoberfest", "ambient", interactionHacktoberfest);

controller.hears(/^dm/, "direct_message,direct_mention", interactionDM);

controller.hears("forget", "direct_mention,direct_message", interactionForget);

controller.hears(
  ["thanks", "thank", "thnx", "thanx", "thx", "thnk", "u da best dino"],
  "mention,indirect_mention,direct_mention,direct_message",
  (bot, message) => {
    bot.reply(message, transcript("thanks"));
  }
);

controller.hears(
  "add this team to the leaders channel",
  "direct_mention",
  interactionLeaderInvite
);

// controller.hears(
//   'stats',
//   'direct_mention,direct_message',
//   interactionStats.default
// )

controller.hears(
  "what are you doing",
  "mention,indirect_mention,direct_mention,direct_message",
  (bot, message) => {
    bot.reply(message, transcript("whatAreYouDoing"));
  }
);

controller.hears(
  ["who are you", "who is"],
  "direct_mention,indirect_mention,direct_message,mention",
  (bot, message) => {
    bot.reply(message, transcript("whoAreYou"));
  }
);

controller.hears(
  "where are you",
  "direct_mention,indirect_mention,direct_message,mention",
  (bot, message) => {
    bot.reply(message, transcript("whereAreYou"));
  }
);

controller.hears("find or create", "direct_mention", interactionFindOrCreate);

controller.hears("date", "direct_mention", interactionDate);

controller.hears("breakout", "direct_mention,indirect_mention", interactionBreakout);
controller.hears("get a room", "ambient", interactionBreakout);

controller.hears(
  ["docs", "documentation", "readme", "source", "repo"],
  "direct_mention,direct_message,indirect_mention",
  interactionDocumentation
);

controller.hears(/(\d+)/, "message_replied", async (bot, message) => {
  if (message.thread.originalPoster) {
    interactionCheckinReply(bot, message);
  }
});

controller.hears("hello", "direct_mention,indirect_mention,direct_message", interactionHello);

controller.hears("hi hey whats whatsup wazzup wazup".split(' '), "mention,direct_mention,direct_message,indirect_mention", (bot, message) => {
  if (Math.random() < 0.1) {
    interactionHello(bot, message);
  } else {
    bot.reply(message, transcript("hi"));
  }
})

controller.hears(
  ["sass", "mock"],
  "direct_message,indirect_mention,direct_mention",
  interactionMocking
);

// catch-all for direct messages
controller.hears(".*", "direct_message,indirect_mention,direct_mention", interactionCatchall);

// catch-all for any message in slack
controller.hears(".*", "ambient", (bot, message) =>{
  interactionHaiku(bot, message)
  interactionCSS(bot, message)
});

// controller.hears(".*", "mention,direct_message,indirect_mention,direct_mention", interactionGamelab)

controller.on("view_submission", async (bot, message) => {
  bot.replyAcknowledge();

  await interactionReportFormSubmit(bot, message);
});

controller.on("message_action", async (bot, message) => {
  const { callback_id, user, channel } = message;

  console.log(
    `Received ${callback_id} message action from user ${user} on a comment in channel ${channel}`
  );

  bot.replyAcknowledge();

  try {
    switch (callback_id) {
      case "flag_comment":
        await interactionReportForm(bot, message);
        break;
      default:
        bot.sendEphemeral({
          channel,
          user,
          text: "I don't know how to do that message action!",
        });
        break;
    }
  } catch (err) {
    console.error(err);
  }
});

controller.on("slash_command", async (bot, message) => {
  const { command, user, channel, text } = message;

  console.log(
    `Received ${command} command from user ${user} in ${channel} with text '${text}'`
  );

  bot.replyAcknowledge();

  bot.replyPrivateDelayed(
    message,
    {
      blocks: [
        {
          type: "context",
          elements: [
            {
              type: "mrkdwn",
              text: `${command} ${text}`,
            },
          ],
        },
      ],
    },
    async (err, res) => {
      if (err) {
        console.error(err);
      }

      try {
        switch (command) {

          case "/airtable":
            await interactionAirtable(bot, message);
            break;

          case "/address":
          // case "/leader-address":
            await interactionAddress(bot, message);
            break;

          case "/my-email":
            await interactionEmail(bot, message);
            break;

          case "/roll":
            await interactionRoll(bot, message);
            break;

          // case "/som-promote":
          //   await interactionSOMPromote(bot, message);
          //   break;
          // case "/som-lookup":
          //   await interactionSOMLookup(bot, message);
          //   break;
          // case '/som-report':
          //   await interactionSOMReport(bot, message)
          //   break
          // case '/som-ban':
          //   await interactionSOMBan(bot, message)
          //   break
          // case '/som-invite':
          //   await interactionSOMInvite(bot, message)
          //   break
          // case "/meeting-stats":
          // case "/stats":
          //   await interactionStats(bot, message);
          //   break;

          // case "/announcement":
          //   await interactionAnnouncement(bot, message);
          //   break;

          // case "/club-address":
          //   await interactionClubAddress(bot, message);
          //   break;

          // case "/club-card":
          //   await interactionClubCard(bot, message);
          //   break;

          // case "/promo":
          //   await interactionPromo(bot, message);
          //   break;

          // case "/get":
          //   await interactionGet(bot, message);
          //   break;

          // case "/rename-channel":
          //   await interactionRename(bot, message);
          //   break;

          // case "/moderate":
          //   await interactionModerate(bot, message);
          //   break;

          // case "/slack-invite":
          //   await interactionSlackInvite(bot, message);
          //   break;

          // case "/report":
          //   await interactionReport(bot, message);
          //   break;

          // case "/meeting-time":
          //   await interactionMeetingTime(bot, message);
          //   break;

          // case "/meeting-add":
          //   await interactionMeetingAdd(bot, message);
          //   break;

          // case "/meeting-remove":
          //   await interactionMeetingRemove(bot, message);
          //   break;

          // case "/meeting-list":
          //   await interactionMeetingList(bot, message);
          //   break;

          // case "/orpheus-tutorial":
          // case "/meeting-tutorial":
          //   await interactionTutorial(bot, message);
          //   break;

          // case "/leader-add":
          //   await interactionLeaderAdd(bot, message);
          //   break;

          // case "/leader-list":
          //   await interactionLeaderList(bot, message);
          //   break;

          default:
            bot.replyPrivateDelayed(
              message,
              "I don't know how to do that ¯\\_(ツ)_/¯"
            );
            break;
        }
      } catch (err) {
        console.error(err);
        bot.replyPrivateDelayed(message, transcript("errors.general", { err }));
      }
    }
  );
});

controller.on("reaction_added", async (bot, message) => {
  bot.replyAcknowledge();
  const { reaction } = message;
  switch (reaction) {
    case 'ultrafastparrot':
    case 'earth_americas':
    case 'earth_africa':
    case 'earth_asia':
      await interactionOlympics(bot, message);
      break;
    case 'face_with_cowboy_hat':
    case 'pleading_cowboy':
    case 'sadcowboy':
    case 'pensivecowboy':
    case 'cowboy-turtle':
    case 'shooting_pepe_cowboy':
      await interactionWildWildWest(bot, message);
      break;
    default:
      break;
  }
});

controller.on("block_actions", (bot, message) => {
  try {
    const { channel, text } = message;
    interactionStats.blockActions(bot, message);
  } catch (err) {
    console.log(err);
  }
});

controller.on("file_share", (bot, message) => {
  try {
    interactionFileShare(bot, message);
  } catch (err) {
    console.log(err);
  }
});

interactionStartup();

// interactionWordcloud();
