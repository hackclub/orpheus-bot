import os
import logging
import orph
import asyncio
import sys
from orph.interaction_support import InteractionManager
import orph.interactions
from orph.util.transcript import Transcript

try:
    import uvloop
    uvloop.install()
except ImportError:
    uvloop = None
class Orpheus:
    __slots__ = ["config", "logger", "env", "slack_app", "interactions", 'transcript']

    from orph.slack import init_slack_app, start_slack_app, bind_event_handlers

    def __init__(self, config):
        orph.i = self
        self.config = config

        self.logger = logging.getLogger('orpheus')
        orph.logger = self.logger

        console_handler = logging.StreamHandler(stream=sys.stdout)

        log_formatter = logging.Formatter('%(asctime)s [%(levelname)-5.5s]  %(message)s')
        console_handler.setFormatter(log_formatter)

        self.logger.addHandler(console_handler)

        level = logging.getLevelName(self.config.logging_level)
        self.logger.setLevel(level)

        self.logger.info('initializing the dinosaur...')
        self.logger.info('creating slack app...')
        self.init_slack_app()
        self.logger.info('loading transcript...')
        self.transcript = Transcript(self.logger)
        orph.transcript = self.transcript


    async def start(self):
        self.logger.info("loading interactions...")
        self.interactions = InteractionManager(self)
        await self.interactions.setup(orph.interactions)

        self.logger.info("running startup tasks...")

        await asyncio.wait(
            [task(orph.env, self) for task in self.interactions.startup_tasks]
        )

        self.bind_event_handlers()
        self.logger.info('"my wife,,,"')
        await self.start_slack_app()

