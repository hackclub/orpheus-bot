# frozen_string_literal: true

module CommonChecks
  include OrpheusContext

  def only_from_users(users)
    users = Array(users)
    check { |event| users.include?(user_from(event)) }
  end

  def only_in_channels(channels)
    channels = Array(channels)
    check do |event|
      channel = event[:channel] || event[:channel_id]
      channels.include?(channel)
    end
  end

  def admin_only
    check { |event| event.dig(:user, :is_admin) }
  end

  def message_text_matches(regex)
    check { |event| regex.match?(event[:text]) }
  end

  def message_shorter_than(length)
    check { |event| event[:text]&.length&.< length }
  end

  def event_has_user
    check { |event| !user_from(event).nil? }
  end

  def user_not_bot
    check { |event| event[:bot_id].nil? && event[:subtype] != "bot_message" }
  end

  alias_method :only_from_user, :only_from_users
  alias_method :only_in_channel, :only_in_channels

  private

  def user_from(event)
    event[:user_id] || (event[:user].is_a?(String) ? event[:user] : event.dig(:user, :id))
  end
end
