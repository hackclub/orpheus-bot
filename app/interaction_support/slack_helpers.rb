module SlackHelpers
  def react(channel, thread_ts, emoji)
    Orpheus.client.reactions_add(channel:, name: emoji, timestamp: thread_ts)
  end

  def remove_reaction(channel, thread_ts, emoji)
    Orpheus.client.reactions_remove(channel:, name: emoji, timestamp: thread_ts)
  rescue Slack::Web::Api::Errors::NoReaction
    # who cares
  end

  def react_to_message(message, emoji)
    channel, ts = extract_channel_and_ts(message)
    begin
      react(channel, ts, emoji)
    rescue Slack::Web::Api::Errors::AlreadyReacted => e
      # pick up a foot ball
    end
  end

  def remove_reaction_from_message(message, emoji)
    channel, ts = extract_channel_and_ts(message)
    remove_reaction(channel, ts, emoji)
  end

  # use with caution!
  def global_react(message, emoji)
    begin
      react_to_message(message, emoji)
    rescue Slack::Web::Api::Errors::SlackError => e
      if e.response["error"] == "not_in_channel"
        Orpheus.client.conversations_join(channel: message["channel"])
        react_to_message(message, emoji)
      else
        raise e
      end
    end
  end

  def reply_in_thread(message, content = nil, **kwargs)
    channel, ts = extract_channel_and_ts(message)
    args = kwargs.merge(channel:, thread_ts: ts)

    if content.is_a?(String)
      args[:text] = content
    end

    if content.is_a?(Hash)
      args.merge!(content)
    end

    Orpheus.client.chat_postMessage(args)
  end

  def extract_channel_and_ts(event)
    [
      event[:channel] || event[:channel_id],
      event[:event_ts],
    ]
  end

  def extract_user(event)
    event[:user_id] ||
      (event[:user].is_a?(String) ? event[:user] : event.dig(:user, :id))
  end

  def reply_ephemerally(message, content = nil, threaded: false, **kwargs)
    channel, ts = extract_channel_and_ts(message)
    args = kwargs.merge(channel:, user: extract_user(message))

    if content.is_a?(String)
      args[:text] = content
    end

    if content.is_a?(Hash)
      args.merge!(content)
    end

    if threaded
      args[:thread_ts] = ts
    end

    Orpheus.client.chat_postEphemeral(args)
  end

  def respond_to_event(event, content = nil, in_channel: false, threaded: false, **kwargs)
    args = kwargs

    if content.is_a?(String)
      args[:text] = content
    end

    if content.is_a?(Hash)
      args.merge!(content)
    end

    if in_channel
      args[:response_type] = "in_channel"
    end

    if threaded
      args[:thread_ts] = event[:event_ts]
    end

    Faraday.new(url: event[:response_url]).post do |req|
      req.headers["Content-Type"] = "application/json"
      req.body = args.to_json
    end
  end

  def users_info_cached(user_id)
    Orpheus.cache.fetch("users_info_#{user_id}", expires_in: 1.hour) do
      Orpheus.client.users_info(user: user_id)
    end
  end

  def check_admin(user_id)
    users_info_cached(user_id).dig(:user, :is_admin)
  end

  module_function :react, :remove_reaction, :react_to_message, :remove_reaction_from_message, :global_react, :reply_in_thread, :extract_channel_and_ts, :extract_user, :reply_ephemerally, :respond_to_event, :users_info_cached, :check_admin
end
