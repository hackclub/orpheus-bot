# frozen_string_literal: true

class WhatsMySlackId < Interaction
  handle :message

  checklist do
    only_in_channel "C0159TSJVH8"
    event_has_user
  end

  def self.call(event)
    poster_id = extract_user(event)
    text = event[:text] || ""

    lines = ["<@#{poster_id}> your Slack ID is `#{poster_id}`"]

    # Grab any <@...> or <#...> mentions, then use the correct prefix
    # based on the ID itself: U = user (@), everything else = channel/group (#)
    text.scan(/<[@#]([A-Za-z0-9]+)>/).each do |match|
      id = match[0]
      prefix = id.start_with?("U") ? "@" : "#"
      lines << "<#{prefix}#{id}> is `#{id}`"
    end

    reply_in_thread(event, lines.join("\n"))
  end
end
