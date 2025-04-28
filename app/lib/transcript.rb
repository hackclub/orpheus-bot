require 'logger'

class TranscriptError < StandardError; end
# this is cursor slop im sorry
class Transcript
  class Context
    def initialize(transcript, parent = nil, vars = {})
      @transcript = transcript
      @parent = parent
      @vars = vars
    end

    def [](key)
      @vars[key] || @vars[key.to_sym] || (@parent&.[](key) if @parent)
    end

    def t(path, vars = {})
      @transcript.t(path, vars)
    end

    def method_missing(name, *args, &block)
      if @vars.key?(name) || @vars.key?(name.to_sym)
        @vars[name] || @vars[name.to_sym]
      elsif @parent
        @parent.send(name, *args, &block)
      else
        super
      end
    end

    def respond_to_missing?(name, include_private = false)
      @vars.key?(name) || @vars.key?(name.to_sym) || (@parent&.respond_to_missing?(name, include_private) if @parent) || super
    end
  end

  attr_reader :transcript_data

  def initialize(file = 'transcript_data.rb', logger: Logger.new(STDOUT))
    @logger = logger
    @transcript_data = load_transcript(file)
  end

  def t(path, vars = {})
    @logger.debug "Looking up '#{path}' with vars: #{vars}" if vars.any?

    # Convert path to array of components
    path_array = case path
                 when Symbol
                   [path]
                 when Array
                   path
                 else
                   path.split('.').map(&:to_sym)
                 end

    target = fetch_path(path_array, @transcript_data)
    context = Context.new(self, @current_context, vars)
    @current_context = context
    evaluate_value(target)
  rescue TranscriptError
    @logger.error "Transcript path not found: #{path}"
    raise
  rescue => e
    @logger.error "Error processing transcript: #{e.message} #{e.backtrace[0..3].join("\n")}"
    "[Error: #{e.message}]"
  ensure
    @current_context = context&.instance_variable_get(:@parent)
  end

  alias_method :call, :t

  def h(&block)
    block
  end

  private

  def load_transcript(path)
    eval(File.read(path))
  rescue => e
    @logger.error "Error loading transcript file: #{e}"
    {}
  end

  def fetch_path(keys, data)
    keys.reduce(data) { |obj, key| 
      if obj.is_a?(Hash)
        # Try both string and symbol keys
        obj[key] || obj[key.to_sym] || nil
      else
        nil
      end
    } || (raise TranscriptError)
  end

  def evaluate_value(value)
    case value
    when Proc
      @current_context.instance_exec(&value)
    when Array
      # If this is a nested array (like in a hash), evaluate each element
      if value.any? { |v| v.is_a?(Hash) || (v.is_a?(Array) && v.any? { |vv| vv.is_a?(Proc) || vv.is_a?(Hash) || vv.is_a?(Array) }) }
        value.map { |v| evaluate_value(v) }
      else
        # If this is a final array (like image_url), sample it and then evaluate the result
        sampled = value.sample
        evaluate_value(sampled)
      end
    when Hash
      value.transform_values { |v| evaluate_value(v) }
    else
      value
    end
  end
end