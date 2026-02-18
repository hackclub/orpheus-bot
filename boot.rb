require "bundler/setup"

require "zeitwerk"
require "active_support/all"

loader = Zeitwerk::Loader.new

loader.push_dir('cruft')
loader.push_dir('app')
loader.push_dir('app/interaction_support')
loader.push_dir('app/interactions')
loader.push_dir('app/lib')

loader.inflector.inflect("cdn" => "CDN")


if ENV['ORPHEUS_ENV'] == 'development'
  require 'dotenv/load'
  loader.enable_reloading
end

loader.setup

loader.eager_load if ENV['ORPHEUS_ENV'] == 'production'
loader.eager_load_dir('app/interactions')

Initialize.do_it!

include Utils

EVENT_HANDLER = Orpheus::EventHandling.method(:fire_event!)
COMMAND_HANDLER = Orpheus::EventHandling.method(:fire_command!)

Orpheus.logger.info(Orpheus.transcript(:startup_log))
if ENV['SOCKET_MODE']
  adapter = Adapters::SlackSocketMode.new(
    EVENT_HANDLER,
    COMMAND_HANDLER,
    get_env!("SLACK_APP_TOKEN")
  )
  adapter.run!
else
  def get_app
    adapter = Adapters::SlackEvents.new(
      EVENT_HANDLER,
      COMMAND_HANDLER,
      get_env!("SLACK_SIGNING_SECRET")
    )
    adapter.app
  end
  if __FILE__ == $0
    get_app.run!
  end
end