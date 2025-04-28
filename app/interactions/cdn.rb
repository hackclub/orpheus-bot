require 'faraday'
require 'json'

class CDN < Interaction
  URL = 'https://cdn.hackclub.com/api/v3/new'

  handle message_subtype: :file_share

  checklist do
    only_in_channel Utils.get_env!('CDN_CHANNEL')
  end

  class << self
    def upload_to_cdn(files)
      Orpheus.logger.info("[cdn] generating links for #{files.length} file(s)")

      file_urls = files.map { |f| f[:url_private] }

      response = Faraday.post(URL) do |req|
        req.headers['Content-Type'] = 'application/json'
        req.headers['Authorization'] = 'Bearer beans'
        req.headers['X-Download-Authorization'] = "Bearer #{Utils.get_env!('SLACK_BOT_TOKEN')}"
        req.body = file_urls.to_json
      end

      if response.success?
        JSON.parse(response.body)
      else
        raise "cdn returned error #{response.status}: #{response.body}"
      end
    end

    def call(event)
      files = event[:files] || []

      begin
        ext_flavor_options = [Orpheus.transcript('fileShare.generic')]
        files.each do |file|
          begin
            ext_flavor_options << Orpheus.transcript("fileShare.extensions.#{file[:filetype]}")
          rescue TranscriptError
            next
          end
        end

        # Start CDN upload in a separate thread
        upload_thread = Thread.new { upload_to_cdn(files) }

        # Start with initial reactions and reply
        react_to_message(event, 'beachball')
        reply_in_thread(event, ext_flavor_options.sample)

        # Wait for upload to complete
        cdn_links = upload_thread.value["files"].map { |file| file["deployedUrl"] }

        # Remove beachball and add success reactions
        remove_reaction_from_message(event, 'beachball')
        react_to_message(event, 'white_check_mark')

        # Send success message
        reply_in_thread(
          event,
          Orpheus.transcript('fileShare.success', {
            links: cdn_links.join("\n"),
            user: event[:user]
          }),
          unfurl_media: false,
          unfurl_links: false
        )

      rescue StandardError => err
        Sentry.capture_exception(err)
        max_file_size = 100_000_000
        file_too_big = files.any? { |f| (f[:size] || 0) > max_file_size }

        if file_too_big
          reply_in_thread(event, Orpheus.transcript('fileShare.errorTooBig'))
        else
          reply_in_thread(event, Orpheus.transcript('fileShare.errorGeneric'))
        end

        remove_reaction_from_message(event, 'beachball')
        react_to_message(event, 'no_entry')
        reply_in_thread(event, Orpheus.transcript('errors.general', { err: }))
      end
    end
  end
end