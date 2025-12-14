# frozen_string_literal: true

module Haiku
  class NoticeThankyou < Interaction
    handle :message

    checklist do
      message_text_matches /thank\s*you|thanks|thx|ty/i # regex is hard
      message_text_matches /(?i).*orph.*/i
      check do |event|
        event[:thread_ts].present? && Haiku::NoticeThankyou.orpheus_posted_haiku_in_thread?(event)
      end
    end

    def self.call(event)
      user = extract_user(event)
      thread_ts = event[:thread_ts]
      
      begin
        react_to_message(event, Orpheus.transcript(:love_emoji))
        reply_in_thread(event, Orpheus.transcript("thank_you.response", { user: }))
        Orpheus.cache.delete("haikued_#{thread_ts}")
      rescue Slack::Web::Api::Errors::NotInChannel
        Orpheus.logger.info("[thankyou] not in channel: #{event[:channel]}")
      rescue StandardError => e
        Orpheus.logger.error("[thankyou] error: #{e.message}")
      end
    end

    private

    def self.orpheus_posted_haiku_in_thread?(event)
      thread_ts = event[:thread_ts]
      Orpheus.cache.read("haikued_#{thread_ts}").present?
    end
  end
end 