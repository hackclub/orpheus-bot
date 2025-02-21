import orph

import asyncio
from aiohttp import web

from slack_bolt.app.async_app import AsyncApp
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler


import logging

def init_slack_app(self):
    self.slack_app = AsyncApp()  # set the env vars :-P
    # self.slack_app.logger.level = logging.DEBUG
    orph.slack_client = self.slack_app.client
    orph.slack_app = self.slack_app


async def start_socket_mode_app(self):
    await AsyncSocketModeHandler(self.slack_app).start_async()

def bind_event_handlers(self):
    self.slack_app.event('message')(self.interactions.handle_message)
    for typo in [
            "event",
            "action",
            "view",
            "shortcut",
            "user_change",
            "file_shared",
            "app_mention"
        ]:
        handler = self.interactions.handler_function(typo)
        # i wonder if there's a better way to bind these?
        self.slack_app.event(typo)(handler)

def bind_slash_commands(self):
    for command in self.interactions.slash_commands:
        self.slack_app.command(command.cmd)(command)