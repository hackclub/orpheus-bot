require 'humanize'

module HaikuCheck
    class << self
        def initialize_syllable_counts
            @syllable_counts ||= begin
                counts = {}
                filepath = File.join(File.dirname(__FILE__), 'haiku_check', 'syllable_counts.txt')
                if File.exist?(filepath)
                    File.foreach(filepath) do |line|
                        word, count = line.split
                        counts[word.downcase] = count.to_i
                    end
                end
                counts
            end
        end

        def get_cmu_syllable_count(word)
            @syllable_counts ||= initialize_syllable_counts
            return nil if word.nil? || word.empty?

            count = @syllable_counts[word]
            return count if count

            # british people...
            if word.length > 3 && word.end_with?("ise")
                word_american = word.sub(/ise$/, 'ize')
                count = @syllable_counts[word_american]
                return count if count
            end

            nil
        end

        def test(text)
            return false unless text.is_a?(String)
            
            # Clean up the text
            text = text.downcase
            text = text.gsub(/[^a-zA-Z0-9\s\.'$]/, '')
            text = text.gsub(/\$/, 'dollar ')
            
            # Convert numbers to words
            text = text.gsub(/\d+/) { |num| num.to_i.humanize }
            
            # Split into words
            words = text.split(/\s+/).reject(&:empty?)
            
            # Initialize haiku lines
            line1, line2, line3 = [], [], []
            syllable_count1 = syllable_count2 = syllable_count3 = 0
            
            words.each do |word|
                # Try dictionary first, fall back to syllables gem
                syllables = get_cmu_syllable_count(word) || SyllableEstimator.estimate(word)
                
                if syllable_count1 < 5
                    if syllable_count1 + syllables <= 5
                        line1 << word
                        syllable_count1 += syllables
                    else
                        return false
                    end
                elsif syllable_count2 < 7
                    if syllable_count2 + syllables <= 7
                        line2 << word
                        syllable_count2 += syllables
                    else
                        return false
                    end
                elsif syllable_count3 < 5
                    if syllable_count3 + syllables <= 5
                        line3 << word
                        syllable_count3 += syllables
                    else
                        return false
                    end
                else
                    return false
                end
            end
            
            if syllable_count1 == 5 && syllable_count2 == 7 && syllable_count3 == 5
                [
                    line1.join(' '),
                    line2.join(' '),
                    line3.join(' ')
                ]
            else
                nil
            end
        end
    end
end
