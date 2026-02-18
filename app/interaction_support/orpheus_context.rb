# frozen_string_literal: true

module OrpheusContext
  def kv = Orpheus.kv
  def cache = Orpheus.cache
  def logger = Orpheus.logger
  def slack_client = Orpheus.client
  def transcript(...) = Orpheus.transcript(...)
  def t = method(:transcript)
end
