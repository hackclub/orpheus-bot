# frozen_string_literal: true

class WhatsMySlackId < Interaction
  handle :message

  checklist do
    only_in_channel "C0159TSJVH8"
    event_has_user
    user_not_bot
  end

  def call
    text = event[:text] || ""

    lines = ["<@#{user}> your Slack ID is `#{user}`"]

    # Grab any <@...> or <#...> mentions, then use the correct prefix
    # based on the ID itself: U = user (@), everything else = channel/group (#)
    text.scan(/<[@#]([A-Za-z0-9]+)>/).each do |match|
      id = match[0]
      prefix = id.start_with?("U") ? "@" : "#"
      lines << "<#{prefix}#{id}> is `#{id}`"
    end

    reply_in_thread t("self_tag.block") if lines.length == 1
    reply_in_thread lines.join("\n")
  end
end
