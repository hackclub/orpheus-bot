# writing interactions:
you should do it!
### how?
read on, but the first thing to do is drop a .rb in this very folder (name it according to Zeitwerk rules, `MostUsefulInteractionEver` should be in `most_useful_interaction_ever.rb`)
if you follow the rest of the steps, everything should magically autoload and register ^_^
### event handling:
subclass `Interaction`, register a handler with `handle`:
```ruby
handle :message # or any other Slack event type
handle message_subtype: :channel_join # for subtypes of Message
```

### slash commands:
subclass `SlashCommand`, register a command with.... `command`.
```ruby
class Foo < SlashCommand
  command "/bar"

  def call
    reply_in_thread t[:dino_test2]
  end
end
```
### doing stuff:
both slash commands and interactions need to implement `call` - this gets invoked when a relevant event fires.

the current event is available as `event`, and there are helpers and delegators available by default:
```ruby
# event accessors
user      # the posting user's ID
channel   # channel ID
ts        # event timestamp

# slack helpers
reply_in_thread "cute little dinosaur roar"
react_to_message "heartbeat"

# orpheus delegators
t["some.transcript.key"]          # transcript lookup (also available as transcript(...))
cache.write("key", val)           # cache
logger.info("something happened") # logger
slack_client.usergroups_create(name: 'the-chosen-ones') # full Slack client for anything else
```
### checklists:
checklists decide whether an interaction runs for an event!

make sure you add a checklist block...
otherwise your interaction will run on every. single. event (of the type it handles).
common checks live in [interaction_support/common_checks](../interaction_support/common_checks.rb), or you can write more specialized checks with `check`.
the first one to say "no" short-circuits the rest and takes the handler out of the running, so it's smart to put your least expensive checks first for speed (i.e. check you're in the right channel before you check a regex match).

```ruby
checklist do
  only_in_channel "C07ETBSJA7L" # use common checks,
  check do |event|              # or write a specific one!
    event[:text].length > 50
  end
end
```

### transcript

all her words live in [transcript_data.rb](../../transcript_data.rb) - please keep it that way so flavor is easy to tweak without hunting through handlers.

```ruby
t[:love_emoji]                             # root key
t["haiku.template", { haiku:, user: }]     # dotted path + vars
```

arrays are randomly sampled on every call. `h { }` blocks in the transcript are evaluated at lookup time - vars you pass in are accessible by name inside them:

```ruby
# in transcript_data.rb:
success: h { "here are your files <@#{user}>!" }

# in your handler:
t["success", { user: }]  # user is now in scope inside the h block
```

raises `TranscriptError` if the path doesn't exist - worth catching if the key is optional.
