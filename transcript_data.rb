# frozen_string_literal: true
# hokay so:
# this is where we keep everything orpheus needs to say, so that it's all in one place and easy to manage
# couple of helper methods you should know:
# t("foo.bar") - evaluate the transcript at dig(:foo, :bar)
# h { <ruby block> } – that block will be hydrated when descending the transcript
# ^ this is particularly useful for things like: h { "i'm like if a dinosaur was a #{t('thing')}" }
# k gl cya!

{
  startup_log: [
    "starting!",
    "starting... i love my wife...",
  ],
  dino_test2: [
    "i live. i hunger. i. am. sinister.",
    "mrow :3",
    "heyo!",
    "im literally a dinosaur.",
  ],
  love_emoji: %w[orpheus-love sparkling_heart aww in_love_orpheus heart-wx 8bit-heart],
  heartbreak_emoji: %w[broken_heart broken_heart-wx broken_heart-hole alibaba-heartbreak no-dot-avi],
  errors: {
    video: h { "This footage was taken moments before the incident #{t("errors.videoURLs")}" },
    videoURLs: [
      "https://www.youtube.com/watch?v=O6WE5C__a70",
      "https://youtu.be/8tAu79kB57s",
      "https://youtu.be/yZ5AVxKf0EM",
      "https://youtu.be/fYM0RuKElIQ",
      "https://youtu.be/r1gNHREgecI",
      "https://youtu.be/ljbSoFJSn1U",
      "https://www.youtube.com/watch?v=lMUSyvTBokc",
    ],
    general: h {
      <<~ERROR
        Something went wrong: `#{err.class}: #{err.message}`
        #{err.respond_to?(:backtrace) ? t("errors.stack", err: err) : ""}
        #{rand < 0.1 ? t("errors.video") : ""}
        error ID: #{defined?(uuid) ? uuid : "unknown"}
      ERROR
        .strip
    },
    stack: h {
      <<~STACK
        ```      
        // stack trace:
        #{err.backtrace&.first(3)&.join("\n")}
        // nora, please go find the full trace
        // code available at https://github.com/hackclub/orpheus-bot
        ```
      STACK
    },
    memory: [
      h { "I think I'm suffering from amnesia... I'm trying to recall what we were talking about, but all that comes to mind is `{#{err.class}: #{err.message}}`" },
      h { "Hmmm... something's on the tip of my tongue, but all I can think is `#{err.class}: #{err.message}`" },
      h { "Do you ever try to remember something, but end up thinking `#{err.class}: #{err.message}` instead? Wait... what were we talking about?" },
      h { "Hmmm... I'm having trouble thinking right now. Whenever I focus, `#{err.class}: #{err.message}` is the only thing that comes to mind" },
      h { "Aw jeez, this is embarrassing. My database just texted me `#{err.class}: #{err.message}`" },
      h { "I just opened my notebook to take a note, but it just says `#{err.class}: #{err.message}` all over the pages" },
    ],
    transcript: [
      "Uh oh, I can't read my script. There's a smudge on the next line.",
      "Super embarrasing, but I just forgot my next line.",
      "I totally forgot what I was talking about.",
    ],
  },
  haiku: {
    template: h do <<~HAIKU
      #{haiku[0]}
      #{haiku[1]}
      #{haiku[2]}
      _– a haiku by <@#{user}>, #{Date.today.year}_
HAIKU
end,
    disabled: h { "#{t("haiku.disabled_flavor")} – you can reënable it with `/haiku-enable`" },
    enabled: h { "#{t("haiku.enabled_flavor")} – you can disable it with `/haiku-disable`" },
    disabled_flavor: [
      "okay, no more haiku for you",
      "got it, not a poetry person",
      "i'll spare you from my poetic wrath",
      "your loss, but i respect your choice",
      "fine, but i'll still be counting syllables in my head",
      "understood, but my inner poet is crying",
      "okay, but my muse is giving you the side-eye",
    ],
    enabled_flavor: [
      "haiku enabled!",
      "your syllables shall now be counted",
      "poetic justice incoming",
      "your inner poet is now free",
      "haiku powers: unlocked",
      "time to channel your inner poet",
    ],
    optout_hint: {
      "blocks": [
        {
          "type": "section",
          "text": {
            "type": "mrkdwn",
            "text": "don't want me\nto notice your poems?\n`/disable-haiku`",
          },
        },
        {
          "type": "context",
          "elements": [
            {
              "type": "plain_text",
              "text": "(to be clear i mean run the above as a slash command to opt out)",
            },
          ],
        },
      ],
    },
  },
  ping: %w[pong pong! 🏓],
  fileShare: {
    generic: "thanks, i'm gonna sell these to adfly!",
    success: h { "Yeah! Here's yo' links <@#{user}>\n#{links}" },
    errorTooBigImages: [
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/2too_big_4.png",
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/3too_big_2.png",
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/4too_big_1.png",
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/6too_big_5.png",
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/7too_big_3.png",
    ],
    errorTooBig: {
      blocks: [
        {
          type: "image",
          title: {
            type: "plain_text",
            text: "File too big!",
            emoji: true,
          },
          image_url: h { t("fileShare.errorTooBigImages") },
          alt_text: "file too large",
        },
      ],
    },
    errorGenericImages: [
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/0generic_3.png",
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/1generic_2.png",
      "https://cloud-3tq9t10za-hack-club-bot.vercel.app/5generic_1.png",
    ],
    errorGeneric: [
      "_orpheus sneezes and drops the files on the ground before blowing her nose on a blank jpeg._",
      "_orpheus trips and your files slip out of her hands and into an inconveniently placed sewer grate._",
      "_orpheus accidentally slips the files into a folder in her briefcase labeled \"homework\". she starts sweating profusely._",
      h {
        {
          blocks: [
            {
              type: "image",
              title: {
                type: "plain_text",
                text: "Error!",
                emoji: true,
              },
              image_url: t("fileShare.errorGenericImages"),
              alt_text: "Something went wrong",
            },
          ],
        }
      },
    ],
    extensions: {
      gif: [
        "_gif_ that file to me and i'll upload it",
        "_gif_ me all all your files!",
      ],
      heic: ["What the heic???"],
      mov: ["I'll _mov_ that to a permanent link for you"],
      html: [
        "Oh, launching a new website?",
        "uwu, what's this site?",
        "WooOOAAah hey! Are you serving a site?",
        "h-t-m-ello :wave:",
      ],
      rar: [
        ".rawr xD",
        "i also go \"rar\" sometimes!",
      ],
    },
  },
  thank_you: {
    response: [
      h { "awww <@#{user}>! :#{t('love_emoji')}:" },
      h { "you're welcome :cool-glasses_dino:" },
      h { "anytime <@#{user}>! :#{t('love_emoji')}:" },
      h { "no problem bucko! :#{t('love_emoji')}:" },
      h { "my pluuuursure :#{t('love_emoji')}:" },
    ],
  },
}
