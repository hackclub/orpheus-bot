from orph.decorators import *

@startup_task()
async def say_hello(dino):
    return await dino.slack_app.client.chat_postMessage(channel='C0P5NE354', text=dino.transcript('startup.message'))