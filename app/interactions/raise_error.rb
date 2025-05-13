class RaiseError < SlashCommand
  command "/raise_error"

  checklist do
    only_from_user "U06QK6AG3RD"
  end

  def self.call(event)
    raise "frick frack snick snack #{event[:text]}"
  end
end