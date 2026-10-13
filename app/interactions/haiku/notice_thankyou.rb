# frozen_string_literal: true
load "./expressions_of_gratitude.rb"

module Haiku
  class NoticeThankyou < Interaction
    handle :message

    checklist do
      
      thanks_formula = "/"
      for string in gratitudes do
        if string == gratitudes[0] then
          thanks_formula = thanks_formula + string
        else
          thanks_formula = thanks_formula + "|" + string
        end
      end
      
      message_text_matches Regexp.new(thanks_formula, Regexp::IGNORECASE)
      message_text_matches /(?i).*(orph|opreus|morpheus).*/i
      check do |event|
        event[:thread_ts].present? && cache.read("haikued_#{event[:thread_ts]}").present?
      end
    end

    def call
      thread_ts = event[:thread_ts]

      begin
        react_to_message t[:love_emoji]
        reply_in_thread t["thank_you.response", { user: }]
        cache.delete "haikued_#{thread_ts}"
      rescue Slack::Web::Api::Errors::NotInChannel
        logger.info "[thankyou] not in channel: #{event[:channel]}"
      rescue StandardError => e
        logger.error "[thankyou] error: #{e.message}"
      end
    end
  end
end
