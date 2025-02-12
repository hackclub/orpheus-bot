import asyncio, re
from orph.interaction_support import check, SlackHandler, StartupTask, SlashCommand


def only_in_channels(channels: list):
    def channel_check(event):
        return event.get('channel', event.get('channel_id')) in channels

    return check(channel_check)


def only_in_channel(channel: str):
    return only_in_channels([channel])


def message_matches_regex(regex):
    pat = re.compile(regex)

    def regex_check(event):
        return bool(pat.match(event.get('text')))

    return check(regex_check)


def message_contains_string(string: str):
    def string_check(event):
        return bool(string in event.get('text', ''))

    return check(string_check)


def message_shorter_than(chars: int):
    def length_check(event):
        return len(event.get('text', '')) <= chars

    return check(length_check)


def only_by_users(users: list):
    def user_check(event):
        return bool(event.get('user_id') in users)
    return check(user_check)

def listen_for(handler_type, subtype=None, **kwargs):
    def decorator(callback):
        if not asyncio.iscoroutinefunction(callback):
            raise TypeError(f'hey! can you make {callback} a coroutine?')
        try:
            checklist = callback.__checks
            del callback.__checks
        except AttributeError:
            checklist = []
        handler_obj = SlackHandler(callback, handler_type, subtype, checklist=checklist, **kwargs)
        return handler_obj

    return decorator


def startup_task():
    def decorator(callback):
        if not asyncio.iscoroutinefunction(callback):
            raise TypeError(f'hey! can you make {callback} a coroutine?')
        try:
            checklist = callback.__checks
            del callback.__checks
        except AttributeError:
            checklist = []
        handler_obj = StartupTask(callback, checklist=checklist)
        return handler_obj

    return decorator


def slash_command(cmd: str):
    if cmd[0] != '/':
        cmd = '/' + cmd

    def decorator(callback):
        if not asyncio.iscoroutinefunction(callback):
            raise TypeError(f'hey! can you make {callback} a coroutine?')
        try:
            checklist = callback.__checks
            del callback.__checks
        except AttributeError:
            checklist = []
        handler_obj = SlashCommand(callback, cmd, checklist=checklist)
        return handler_obj

    return decorator
