module Orpheus
  class << self
    def logger
      @logger ||= Logger.new(STDOUT, level: Logger::INFO)
    end

    def client
      @client ||= Slack::Web::Client.new(token: Utils.get_env!("SLACK_BOT_TOKEN"))
    end

    def _transcript
      @transcript ||= Transcript.new('transcript_data.rb')
    end

    def transcript(*args, **kwargs, &block)
      _transcript.t(*args, **kwargs, &block)
    end

    def production?
      ENV['ORPHEUS_ENV'] == 'production'
    end

    attr_accessor :cache
    attr_accessor :kv

  end

  class AbortHandlerChain < Exception; end

  logger.info("loading haiku tables...")
  HaikuCheck.initialize_syllable_counts
  logger.info("haiku tables loaded!")
end