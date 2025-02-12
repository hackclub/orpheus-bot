from orph.decorators import *

import orph
from orph.util import global_react

@listen_for("message")
@message_contains_string(":rac_shy:")
async def theyll_never_be_able_to_prove_it(args):
    orph.logger.info(':3')
    await global_react(args.message, orph.transcript('heart_emoji'))