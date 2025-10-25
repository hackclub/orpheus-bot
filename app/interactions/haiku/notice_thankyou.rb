# frozen_string_literal: true

module Haiku
  class NoticeThankyou < Interaction
    handle :message

    checklist do
      message_text_matches /thank\s*you|thanks|thx/i # regex is hard
      check do |event|
        event[:thread_ts].present? && Haiku::NoticeThankyou.orpheus_posted_haiku_in_thread?(event)
      end
    end

    def self.call(event)
      user = extract_user(event)
      
      begin
        react_to_message(event, Orpheus.transcript(:love_emoji))
        reply_in_thread(event, Orpheus.transcript("thank_you.response", { user: }))
      rescue Slack::Web::Api::Errors::NotInChannel
        Orpheus.logger.info("[thankyou] not in channel: #{event[:channel]}")
      rescue StandardError => e
        Orpheus.logger.error("[thankyou] error: #{e.message}")
      end
    end

    private

    def self.orpheus_posted_haiku_in_thread?(event)
      channel = event[:channel]
      thread_ts = event[:thread_ts]
      cache_key = "haiku_in_thread_#{channel}_#{thread_ts}"
      
      Orpheus.cache.fetch(cache_key, expires_in: 10.minutes) do
        begin
          response = Orpheus.client.conversations_replies(
            channel: channel,
            ts: thread_ts,
            limit: 10 
          )
          
          response.messages.any? do |message|
            is_bot_message = message[:bot_id].present? || message[:app_id].present?
            
            contains_haiku = message[:text]&.match?(/_– a haiku by <@\w+>, \d{4}_/) # must give thanks to chatgpt for this wonderful regex
            
            is_bot_message && contains_haiku
          end
        rescue StandardError => e
          Orpheus.logger.error("[thankyou] error checking for haiku: #{e.message}")
          false 
        end
      end
    end
  end
end 