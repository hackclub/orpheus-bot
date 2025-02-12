import orph

from slack_bolt.app.async_app import AsyncApp
from slack_bolt.adapter.socket_mode.async_handler import AsyncSocketModeHandler


def init_slack_app(self):
    self.slack_app = AsyncApp()  # set the env vars :-P
    orph.slack_client = self.slack_app.client
    orph.slack_app = self.slack_app


async def start_slack_app(self):
    if self.config.socket_mode:
        await AsyncSocketModeHandler(self.slack_app).start_async()
    else:
        self.slack_app.start(self.config.port or 3000)


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