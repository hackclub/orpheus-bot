# frozen_string_literal: true

class SlashCommand
  include HandlerContext
  include HasChecklist
  include SlackHelpers

  def call = Orpheus.logger.error "HEY! #{self.class.inspect} doesn't implement #call!"

  class << self
    def command(command)
      Orpheus::EventHandling.register_command(command: command, interaction: self)
    end
  end
end
