require 'sinatra/base'
require 'sinatra/custom_logger'
require 'json'
require 'slack-ruby-client'

module Adapters
  class SlackEvents
    attr_accessor :event_callback, :command_callback, :signing_secret

    def initialize(event_callback, command_callback, signing_secret)
      @event_callback = event_callback
      @command_callback = command_callback
      @signing_secret = signing_secret
    end

    def app
      @app ||= App.with(
        event_callback: event_callback,
        command_callback: command_callback,
        signing_secret: signing_secret
      )
    end

    class App < Sinatra::Base
      set :logger, Orpheus.logger

      # HEALTHCHECK:
      # doesn't test anything real, just sees if app booted
      get '/u_up?' do
        "not now heidi i'm at work"
      end

      def self.with(event_callback:, command_callback:, signing_secret:)
        Class.new(self) do
          set :event_callback, event_callback
          set :command_callback, command_callback
          set :signing_secret, signing_secret
        end
      end

      post "/slack_events_go_here" do
        verify_slack_request!
        data = JSON.parse(request.body.read, symbolize_names: true)

        case data[:type]
        when "url_verification"
          data[:challenge]
        when "event_callback"
          Thread.new do
            Sentry.with_scope do |scope|
              scope.clear_breadcrumbs
              settings.event_callback.call(data)
            end
          end
          "ok!"
        end
      end

      post "/slash_commands_go_here" do
        verify_slack_request!
        Thread.new do
          Sentry.with_scope do |scope|
            scope.clear_breadcrumbs
            settings.command_callback.call(params)
          end
        end
      end

      error Slack::Events::Request::MissingSigningSecret do
        status 403
        "stop it. get some help."
      end

      error Slack::Events::Request::InvalidSignature do
        status 401
        "better luck next time!"
      end

      error Slack::Events::Request::TimestampExpired do
        status 418
        "huh?"
      end

      error 404 do
        <<~EOH
<!DOCTYPE html>
<html>
    <head>
        <title>
            *confused dinosaur noises*
        </title>
        <!-- what are you doing here?-->
        <style>
            body {
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                margin: 0;
            }
            img {
                max-width: 100%;
                height: auto;
            }
        </style>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
    </head>
    <body>
        <img src="https://github.com/hackclub/dinosaurs/raw/main/dino_in_a_box_v2.png" alt="dino saur"/>
    </body>
</html>
        EOH
      end

      private

      def verify_slack_request!
        slack_request = Slack::Events::Request.new(request)
        slack_request.verify!
      end

      error do
        Sentry.capture_exception(env['sinatra.error'])
      end
    end
  end
end