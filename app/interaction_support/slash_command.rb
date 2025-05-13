# frozen_string_literal: true

class SlashCommand
  include HasChecklist

  class << self
    include SlackHelpers

    def command(command)
      Orpheus::EventHandling.register_command(command: command, interaction: self)
    end
  end
end
