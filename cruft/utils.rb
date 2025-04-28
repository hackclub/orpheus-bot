module Utils
  def get_env!(key)
    res = ENV[key]
    raise Errors::ConfigError, "plz set #{key}!" unless res
    res
  end
  module_function :get_env!
end