# frozen_string_literal: true

class ThumpThump < Interaction
  handle :message

  checklist do
    only_in_channel "CLU651WHY"
    message_text_matches /thump/
  end

  def call
    unless is_admin?(user)
      logger.info 'who do they think they are, playing with my heart like that?'

      react_to_message t[:heartbreak_emoji] and return
    end

    logger.info 'I can hear my heart beat in my chest... it fills me with determination'
    react_to_message 'heartbeat'
  end
end
