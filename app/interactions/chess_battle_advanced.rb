# frozen_string_literal: true

class ChessBattleAdvanced < Interaction
  handle :message

  checklist do
    message_text_matches /.*chess battle advanced.*$/i
    event_has_user
    user_not_bot
  end

  def call
    message_info = { channel: event[:channel] || event[:channel_id], event_ts: event[:thread_ts] || event[:event_ts] || event[:ts] }

    begin
      reply_in_thread "https://cdn.hackclub.com/019e4030-69ed-7e05-b6ce-d31cd5274183/1z7eh.mp4", message: message_info
    rescue Slack::Web::Api::Errors::NotInChannel
      logger.info "[chess_battle_advanced] not in channel: #{event[:channel]}"
    end
  end
end
