# frozen_string_literal: true

module CommonChecks
  def only_from_users(users)
    users = Array(users)
    check do |event|
      user = SlackHelpers.extract_user(event)
      users.include?(user)
    end
  end

  def only_in_channels(channels)
    channels = Array(channels)
    check do |event|
      channel = event[:channel] || event[:channel_id]
      channels.include?(channel)
    end
  end

  def admin_only
    check do |event|
      event.dig(:user, :is_admin)
    end
  end

  def message_text_matches(regex)
    check do |event|
      text = event[:text]
      regex.match?(text)
    end
  end

  def message_shorter_than(length)
    check do |event|
      event[:text]&.length&.< length
    end
  end

  def event_has_user
    check do |event|
      user = SlackHelpers.extract_user(event)
      !user.nil?
    end
  end

  alias_method :only_from_user, :only_from_users
  alias_method :only_in_channel, :only_in_channels
end
