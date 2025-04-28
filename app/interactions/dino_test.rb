class DinoTest < SlashCommand
  command "/dino_test2"

  def self.call(event)
    reply_in_thread(event, Orpheus.transcript(:dino_test2))
  end
end