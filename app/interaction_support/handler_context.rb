# frozen_string_literal: true

module HandlerContext
  include OrpheusContext

  attr_reader :event

  def initialize(event)
    @event = event
  end

  def user = event[:user_id] || (event[:user].is_a?(String) ? event[:user] : event.dig(:user, :id))
  def channel = event[:channel] || event[:channel_id]
  def ts = event[:event_ts]
end
