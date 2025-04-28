module HasChecklist
  extend ActiveSupport::Concern

  included do
    @_checklist = Checklist.new
    extend ClassMethods
    self.class.attr_reader :_checklist
  end

  module ClassMethods
    def checklist(&block)
      @_checklist ||= Checklist.new
      @_checklist.instance_eval(&block)
    end

    def checks_pass?(event)
      @_checklist ||= Checklist.new
      @_checklist.pass?(event)
    end
  end
end