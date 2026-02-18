# frozen_string_literal: true

module Haiku
  class DisableHaiku < SlashCommand
    command "/disable-haiku"

    def call
      kv.set "haiku_disabled_#{event[:user_id]}", true
      respond_to_event t["haiku.disabled"]
    end
  end
end
