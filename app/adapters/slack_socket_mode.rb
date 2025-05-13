require "slack-ruby-socket-mode-bot"

module Adapters
  class SlackSocketMode
    attr_reader :app_token, :socket_mode_client, :callback

    def initialize(event_callback, command_callback, app_token)
      @event_callback = event_callback
      @command_callback = command_callback
      @app_token = app_token
      @socket_mode_client = SlackSocketModeBot::Transport::SocketModeClient.new(
        app_token:,
        logger: Orpheus.logger,
        callback: proc do |event|
          Honeybadger.context(
            transaction_name: "slack_socket_mode_#{event.dig(:event, :event_ts)}",
          ) do

          Honeybadger.add_breadcrumb(
            "Slack socket mode event",
            metadata: {
              type: event[:type],
              event_ts: event.dig(:event, :event_ts),
              data: event,
            },
            category: "slack",
          )

          if event[:command]
            command_callback.call(event)
          else
            event_callback.call(event)
          end
          end
          Honeybadger.context.clear!
        end,
      )
    end

    def run!
      socket_mode_client.run!
    end
  end
end
