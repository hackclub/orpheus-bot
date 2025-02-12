from orph.decorators import *

@slash_command('dino_test')
@only_by_users(['U06QK6AG3RD'])
async def dino_test(args):
    args.respond('hey!')