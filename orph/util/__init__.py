import orph
from slack_sdk.errors import SlackApiError

async def react(channel, thread_ts, emoji):
    return await orph.slack_client.reactions_add(channel=channel, name=emoji, timestamp=thread_ts)


async def remove_reaction(channel, thread_ts, emoji):
    return await orph.slack_client.reactions_remove(channel=channel, name=emoji, timestamp=thread_ts)


async def react_to_message(message, emoji):
    channel, ts = extract_channel_and_ts(message)
    return await react(channel, ts, emoji)

# use with caution!
async def global_react(message, emoji):
    try:
        return await react_to_message(message, emoji)
    except SlackApiError as e:
        if e.response['error'] == 'not_in_channel':
            await orph.slack_client.conversations_join(channel=message['channel'])
            return await react_to_message(message, emoji)

async def remove_reaction_from_message(message, emoji):
    channel, ts = extract_channel_and_ts(message)
    return await remove_reaction(channel, ts, emoji)

async def reply_in_thread(message, text, **kwargs):
    channel, ts = extract_channel_and_ts(message)
    return await orph.slack_client.chat_postMessage(channel=channel, text=text, thread_ts=ts, **kwargs)

def extract_channel_and_ts(event):
    return (
        event.get('channel', event.get('channel_id')),
        event.get('ts', event.get('event_ts', None))
    )