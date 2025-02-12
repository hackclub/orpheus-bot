import orph
from orph.decorators import *
from orph.util import reply_in_thread

@listen_for("app_mention")
@message_contains_string("ping")
async def ping(args):
    await reply_in_thread(args.event, orph.transcript('ping'))