module SlackHelpers
  def react(channel, thread_ts, emoji)
    slack_client.reactions_add(channel:, name: emoji, timestamp: thread_ts)
  end

  def remove_reaction(channel, thread_ts, emoji)
    slack_client.reactions_remove(channel:, name: emoji, timestamp: thread_ts)
  rescue Slack::Web::Api::Errors::NoReaction
    # who cares
  end

  def react_to_message(emoji, message: nil)
    message ||= @event
    begin
      react(message[:channel] || message[:channel_id], message[:event_ts], emoji)
    rescue Slack::Web::Api::Errors::AlreadyReacted
      # pick up a foot ball
    end
  end

  def remove_reaction_from_message(emoji, message: nil)
    message ||= @event
    remove_reaction(message[:channel] || message[:channel_id], message[:event_ts], emoji)
  end

  # use with caution!
  def global_react(emoji, message: nil)
    message ||= @event
    channel = message[:channel] || message[:channel_id]
    begin
      react_to_message(emoji, message: message)
    rescue Slack::Web::Api::Errors::NotInChannel => e
      slack_client.conversations_join(channel:)
      begin
        react_to_message(emoji, message: message)
      rescue Slack::Web::Api::Errors::NotInChannel
        Orpheus.logger.error("Failed to react to message #{message[:event_ts]} in channel #{channel}: #{e.message}")
      end
    end
  end

  def reply_in_thread(content = nil, message: nil, **kwargs)
    message ||= @event
    args = kwargs.merge(channel: message[:channel] || message[:channel_id], thread_ts: message[:event_ts])

    if content.is_a?(String)
      args[:text] = content
    end

    if content.is_a?(Hash)
      args.merge!(content)
    end

    slack_client.chat_postMessage(args)
  end

  def reply_ephemerally(content = nil, message: nil, threaded: false, **kwargs)
    message ||= @event
    channel = message[:channel] || message[:channel_id]
    user_id = message[:user_id] || (message[:user].is_a?(String) ? message[:user] : message.dig(:user, :id))
    args = kwargs.merge(channel:, user: user_id)

    if content.is_a?(String)
      args[:text] = content
    end

    if content.is_a?(Hash)
      args.merge!(content)
    end

    args[:thread_ts] = message[:event_ts] if threaded

    slack_client.chat_postEphemeral(args)
  end

  def respond_to_event(content = nil, message: nil, in_channel: false, threaded: false, **kwargs)
    message ||= @event
    args = kwargs

    if content.is_a?(String)
      args[:text] = content
    end

    if content.is_a?(Hash)
      args.merge!(content)
    end

    args[:response_type] = "in_channel" if in_channel
    args[:thread_ts] = message[:event_ts] if threaded

    Faraday.new(url: message[:response_url]).post do |req|
      req.headers["Content-Type"] = "application/json"
      req.body = args.to_json
    end
  end

  def users_info_cached(user_id)
    Orpheus.cache.fetch("users_info_#{user_id}", expires_in: 1.hour) do
      slack_client.users_info(user: user_id)
    end
  end

  def is_admin?(user_id) = users_info_cached(user_id).dig(:user, :is_admin)

  module_function :react, :remove_reaction, :react_to_message, :remove_reaction_from_message, :global_react, :reply_in_thread, :reply_ephemerally, :respond_to_event, :users_info_cached, :is_admin?
end
