class NotCanon < Interaction
  handle :message

  checklist do
    message_text_matches /:rac_(shy|cute|yap):/
  end

  def call
    react_to_message t[:love_emoji]
  rescue Slack::Web::Api::Errors::NotInChannel
    # who gaf
  end
end
