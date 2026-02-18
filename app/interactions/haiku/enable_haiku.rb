# frozen_string_literal: true

module Haiku
  class EnableHaiku < SlashCommand
    command "/enable-haiku"

    def call
      kv.del "haiku_disabled_#{event[:user_id]}"
      respond_to_event t["haiku.enabled"]
    end
  end
end
