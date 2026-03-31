module MockingString
  refine String do
    def reverse_case
      if self == self.upcase
        self.downcase
      else
        self.upcase
      end
    end

    def to_mock
      # this'd be simple with just a plain old
      # chars.each_with_index.map { |c, i| i.even? ? c.downcase : c.upcase }.join
      # but we're getting more complex because stuff in <tags> on slack fails to
      # render in some clients when capitalization is played with

      in_bracket = 0

      chars.each_with_index.map do |c, i|
        case c
        when '<'
          in_bracket += 1
          c
        when '>'
          in_bracket -= 1
          c
        else
          if i.even? && in_bracket == 0
            c.reverse_case
          else
            c
          end
        end
      end.join
    end
  end
end

class MockingSpongebob < Interaction
  using MockingString
  handle :app_mention

  checklist do
    check { rand < 0.1 }
    message_shorter_than 100
    # bot is mentioned
  end

  def call
    message = event[:text]
    reply_in_thread ":spongebob-mocking: #{message.to_mock}"
  end
end
