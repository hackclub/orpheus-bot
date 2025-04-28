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

  def self.call(event)
    reply_in_thread(event, "baz!!!")
  end
end
```
### doing stuff:
both slash commands and interactions need to implement the class method `call(event)` – this gets passed the Slack event body when a relevant event fires.

there are some helpers for common slack interaction stuff in [SlackHelpers](../interaction_support/slack_helpers.rb) included by default:
```ruby
reply_in_thread(event, "<cute little dinosaur roar>")
```
if you're doing something more complicated, there's a `Slack::Web::Client` available at `Orpheus.client` like so:
```ruby
Orpheus.client.usergroups_create(name: 'the-chosen-ones')
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

when she says things, please have her read them from the [Transcript](../../transcript_data.rb) to facilitate easy flavor rewriting.

just `Orpheus.transcript(:root_key)` or `Orpheus.transcript "path.with.several.subkeys"`!