class DinoTest < SlashCommand
  command "/dino_test2"

  def call = reply_in_thread transcript(:dino_test2)
end
