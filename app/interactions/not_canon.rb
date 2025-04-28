class NotCanon < Interaction
  handle :message

  checklist do
    message_text_matches /:rac_(shy|cute|yap):/
  end

  def self.call(event)
    react_to_message event, Orpheus.transcript(:love_emoji)
  end
end