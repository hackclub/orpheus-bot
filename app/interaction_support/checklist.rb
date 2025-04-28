class Checklist
  include CommonChecks

  def initialize
    @checks = []
  end

  attr_accessor :checks

  def empty?
    checks.empty?
  end

  def pass?(event)
    return true if empty?
    checks.all? { |check| check.call(event) }
  end

  def check(&block)
    @checks << block
  end
end