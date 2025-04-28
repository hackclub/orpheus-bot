# frozen_string_literal: true
class Interaction
  include HasChecklist

  class << self
    include SlackHelpers

    def handle(type=nil, message_subtype: nil)
      Orpheus::EventHandling.register_interaction(type:, message_subtype:, interaction: self)
    end

    def call(event)
      Orpheus.logger.error "HEY! #{self.inspect} doesn't implement .call!"
    end
  end
end

