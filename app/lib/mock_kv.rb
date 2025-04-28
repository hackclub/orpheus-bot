class MockKv
  def initialize(file_path = 'mock_kv_store.txt')
    @file_path = file_path
    @store = {}
    load_from_file
  end

  def get(key)
    @store[key]
  end

  def set(key, value)
    @store[key] = value
    save_to_file
    value
  end

  def del(key)
    @store.delete(key)
    save_to_file
  end

  private

  def load_from_file
    return unless File.exist?(@file_path)
    
    File.foreach(@file_path) do |line|
      key, value = line.chomp.split(':', 2)
      @store[key] = eval(value) if key && value
    end
  end

  def save_to_file
    File.open(@file_path, 'w') do |file|
      @store.each do |key, value|
        file.puts("#{key}:#{value.inspect}")
      end
    end
  end
end