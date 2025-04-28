require 'slack-ruby-socket-mode-bot'

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
          Sentry.with_scope do |scope|
            scope.clear_breadcrumbs
            ts = event.dig(:event, :event_ts)
            scope.set_transaction_name("slack_socket_mode_#{ts}") if ts

            Sentry.add_breadcrumb(
              Sentry::Breadcrumb.new(
                type: "user",
                category: "slack",
                message: "Slack socket mode event: #{event[:type]} @ #{event.dig(:event, :event_ts)}",
                data: event
              )
            )

            if event[:command]
              command_callback.call(event)
            else
              event_callback.call(event)
            end

          end
        end
      )
    end

    def run!
      socket_mode_client.run!
    end
  end
end