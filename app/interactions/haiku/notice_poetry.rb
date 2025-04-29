# frozen_string_literal: true

module Haiku
  class NoticePoetry < Interaction
    handle :message

    checklist do
      message_shorter_than 300 # adjust to taste, but remember that this is slow and runs on every not-opted-out message
      check do |event|
        !Orpheus.kv.get("haiku_disabled_#{SlackHelpers.extract_user(event)}")
      end
    end

    def self.call(event)
      user = extract_user(event)
      haiku = HaikuCheck.test(event[:text])

      return unless haiku

      global_react(event, "haiku")
      reply_in_thread(event, Orpheus.transcript("haiku.template", { haiku:, user: }))

      unless Orpheus.kv.get("haiku_hinted_#{user}")
        reply_ephemerally(event, Orpheus.transcript("haiku.optout_hint"), threaded: true)
        Orpheus.kv.set("haiku_hinted_#{user}", true)
      end
    end
  end
end