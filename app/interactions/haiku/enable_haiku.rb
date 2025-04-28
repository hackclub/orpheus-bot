# frozen_string_literal: true

module Haiku
  class EnableHaiku < SlashCommand
    command "/enable-haiku"

    def self.call(event)
      Orpheus.kv.del("haiku_disabled_#{event[:user_id]}")
      respond_to_event(event, Orpheus.transcript("haiku.enabled"))
    end
  end
end
