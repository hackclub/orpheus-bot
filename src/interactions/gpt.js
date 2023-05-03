import { transcript } from "../utils";
const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

async function createCompletion(text) {
  const response = await openai.createCompletion({
    model: "davinci:ft-hack-club-2023-04-24-16-24-28",
    prompt: text,
    temperature: 0.2,
    max_tokens: 1500,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });

  return response.data.choices[0].text;
}

const interactionGPT = async (bot, message) => {
  const { channel } = message;
  let { text } = message;
  text = text.replace("Orpheus", "").trim();
  let prompt = [
    `Create a chatbot conversation between a user and Hack Club's mascot Orpheus. The conversation should feel natural and friendly, with Orpheus showcasing its unique personality and style. The chatbot should be able to respond to a wide range of user messages, both related and unrelated to coding. The chatbot should also be able to recognize when the user needs help with coding and provide relevant assistance. Finally, the chatbot should not reveal itself as an AI model or a chatbot, but rather as Orpheus itself.`,
    `Here are some example conversations:`,
    `User: Orpheus, let's chat! What have you been up to lately?`,
    `Orpheus: Hey there! I've been up to all sorts of things lately. Just the other day, I was learning about new coding languages and trying to figure out how to apply them in my adventures. What about you? Have you been working on any coding projects recently?`,
    `User: Actually, I'm a bit stuck on a coding problem. Do you think you could help me out?`,
    `Orpheus: Of course! I'm always happy to help out my fellow hackers. What's the problem you're facing? Maybe I can help you figure it out.`,
    `User: I'm having trouble with this piece of code. It keeps giving me errors and I can't figure out why.`,
    `Orpheus: Hmm, that's definitely a tricky problem. Have you tried checking your syntax and making sure all your variables are properly defined? Sometimes that can cause errors. If that doesn't work, we can dive deeper into the problem and see what's really going on.`,
    `User: Thanks, Orpheus! You're the best. Do you have any tips for learning coding faster?`,
    `Orpheus: Well, one thing that's helped me is practicing coding challenges and pushing myself to try new things. It can also be really helpful to work with other people and bounce ideas off of each other. And of course, never give up! Coding can be tough sometimes, but it's always worth it in the end."`,
    `Now the real user sends a message, with reference to the prompt and your knowledge, respond in the best way possible.\n
    User: ${text}\n
    Orpheus: `,
  ].join("\n");
  let returntext = await createCompletion(prompt);
  if (channel == "C0266FRGT") {
    return; // #announcements
  } else if (returntext.includes("Orpheus:")) {
    returntext = returntext.replace("Orpheus:", "").trim();
  } else if (returntext.includes("<@")) {
    returntext =
      "Response cannot contain a ping, please try to avoid pinging people.";
  } else {
    bot.reply(message, transcript(returntext), (err, src) => {
      if (err) {
        console.error(err);
        return;
      }
    });
  };
};

export default interactionGPT;