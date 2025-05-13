module Initialize
  def self.do_it!
    require "redis"

    Orpheus.cache = if Orpheus.production?
        ActiveSupport::Cache::MemCacheStore.new(Utils.get_env!("MEMCACHED_URL"))
      else
        ActiveSupport::Cache::MemoryStore.new
      end

    Orpheus.kv ||= if Orpheus.production?
        ConnectionPool::Wrapper.new do
          Redis.new(url: Utils.get_env!("REDIS_URL"))
        end
      else
        MockKv.new
      end
  end

  require "honeybadger"
end
