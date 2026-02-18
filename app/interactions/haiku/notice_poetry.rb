# frozen_string_literal: true

module Haiku
  class NoticePoetry < Interaction
    handle :message

    checklist do
      event_has_user
      check do |event|
        !%w(channel_join).include?(event[:subtype])
      end
      message_shorter_than 300 # adjust to taste, but remember that this is slow and runs on every not-opted-out message
      check { |event| !kv.get("haiku_disabled_#{user_from(event)}") }
      check do |event|
        event[:channel] != "C09MATKQM8C"
      end
    end

    def call
      haiku = HaikuCheck.test(event[:text])

      return unless haiku

      global_react "haiku"
      begin
        reply_in_thread t["haiku.template", { haiku:, user: }]
        thread_ts = event[:thread_ts] || event[:ts]
        cache.write("haikued_#{thread_ts}", true, expires_in: 12.hours) # used in thankyou interaction
      rescue Slack::Web::Api::Errors::NotInChannel
        logger.info "[haiku] not in channel: #{event[:channel]}"
        return
      end

      unless kv.get("haiku_hinted_#{user}")
        reply_ephemerally t["haiku.optout_hint"], threaded: true
        kv.set "haiku_hinted_#{user}", true
      end
    end
  end
end
