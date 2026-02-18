# frozen_string_literal: true

class Interaction
  include HandlerContext
  include HasChecklist
  include SlackHelpers

  def call = Orpheus.logger.error "HEY! #{self.class.inspect} doesn't implement #call!"

  class << self
    def handle(type = nil, message_subtype: nil)
      Orpheus::EventHandling.register_interaction(type:, message_subtype:, interaction: self)
    end
  end
end
