# frozen_string_literal: true

module Haiku
  class DisableHaiku < SlashCommand
    command "/disable-haiku"

    def self.call(event)
      Orpheus.kv.set("haiku_disabled_#{event[:user_id]}", true)
      respond_to_event(event, Orpheus.transcript("haiku.disabled"))
    end
  end
end
