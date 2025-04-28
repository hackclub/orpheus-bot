
module Initialize
  def self.do_it!
    require 'sentry-ruby'
    require 'redis'

    Sentry.init do |config|
      config.dsn = ENV["SENTRY_DSN"]
      config.breadcrumbs_logger = [:sentry_logger, :http_logger, :redis_logger]
      config.enabled_patches << :faraday
      config.environment = Orpheus.production? ? 'production' : 'development'
    end

    Orpheus.cache = if Orpheus.production?
                      ActiveSupport::Cache::MemCacheStore.new(Utils.get_env!('MEMCACHED_URL'))
                    else
                      ActiveSupport::Cache::MemoryStore.new
                    end

    Orpheus.kv ||= if Orpheus.production?
                     ConnectionPool::Wrapper.new do
                       Redis.new(url: Utils.get_env!('REDIS_URL'))
                     end
                   else
                     MockKv.new
                   end
    end
end