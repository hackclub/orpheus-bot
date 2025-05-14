module Utils
  def get_env!(key)
    res = ENV[key]
    raise Errors::ConfigError, "plz set #{key}!" unless res
    res
  end

  def step_on_with_dino_hoof(hash, prefix = nil)
    hash.each_with_object({}) do |(k, v), result|
      key = prefix ? "#{prefix}_#{k}".to_sym : k.to_sym

      if v.is_a?(Hash)
        result.merge!(step_on_with_dino_hoof(v, key))
      else
        result[key] = v
      end
    end
  end

  module_function :get_env!, :step_on_with_dino_hoof
end
