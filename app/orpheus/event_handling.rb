# frozen_string_literal: true

module Orpheus
  class EventHandling
    class << self
      attr_reader :handlers, :subtype_handlers, :slash_commands

      def register_interaction(type: nil, message_subtype: nil, interaction:, high_pri: false)
        raise ArgumentError, "plz provide either type or message_subtype!" unless type || message_subtype

        Orpheus.logger.info "I just learned how to #{interaction.inspect}!"

        target_array = if message_subtype
            (@subtype_handlers ||= {})[message_subtype] ||= []
          else
            (@handlers ||= {})[type] ||= []
          end

        if high_pri
          target_array.unshift(interaction)
        else
          target_array << interaction
        end
      end

      def register_command(command:, interaction:)
        command = "/#{command}" unless command.start_with?("/")
        Orpheus.logger.info "are you /srs or #{command}?"
        (@slash_commands ||= {})[command] = interaction
      end

      def fire_event!(payload)
        event = payload[:event]
        type = event[:type].to_sym

        Honeybadger.add_breadcrumb(
          "Slack event",
          metadata: Utils.step_on_with_dino_hoof(event, :event),
          category: "slack",
        )

        handler_queue = []

        if type == :message
          subtype = event[:subtype]&.to_sym
          if subtype_handlers&.[](subtype)
            handler_queue += subtype_handlers[subtype].map { |h| h.new(event) }.select(&:checks_pass?)
          end
        end

        # Always check type-specific handlers
        if handlers&.[](type)
          handler_queue += handlers[type].map { |h| h.new(event) }.select(&:checks_pass?)
        end

        handler_queue.each do |instance|
          begin
            instance.call
          rescue Orpheus::AbortHandlerChain
            Orpheus.logger.debug("#{instance.class.inspect} aborted handler chain.")
            break
          rescue StandardError => e
            Honeybadger.notify(e)
            Orpheus.logger.error(e) unless Orpheus.production?
          end
        end
      end

      def fire_command!(payload)
        command = payload[:command]
        Honeybadger.add_breadcrumb(
          "Slack slash command",
          metadata: {
            command: command,
            data: payload,
          },
          category: "slack",
        )
        handler = @slash_commands[command]
        if handler
          instance = handler.new(payload)
          if instance.checks_pass?
            begin
              instance.call
            rescue StandardError => e
              Honeybadger.notify(e)
              Orpheus.logger.error(e) unless Orpheus.production?
            end
          end
        else
          Orpheus.logger.warn("uhh i just got asked to #{command} and i'm not really sure what to do about it...")
          Honeybadger.notify("unhandled slash command #{command}")
        end
      end
    end
  end
end
