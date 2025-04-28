# frozen_string_literal: true

class ThumpThump < Interaction
  handle :message

  checklist do
    only_in_channel "CLU651WHY"
    message_text_matches /thump/
  end

  def self.call(event)
    unless check_admin(extract_user(event))
      Orpheus.logger.info 'who do they think they are, playing with my heart like that?'

      react_to_message event, Orpheus.transcript(:heartbreak_emoji)
      return
    end

    Orpheus.logger.info 'I can hear my heart beat in my chest... it fills me with determination'
    react_to_message event, 'heartbeat'
  end
end
