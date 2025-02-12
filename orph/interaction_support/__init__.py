# . ABANDON HOPE ALL YE WHO ENTER HERE .
# this file looks like this so other interaction_support can look as nice as they do

from functools import wraps
from types import FunctionType
from typing import Callable, Any
from orph import get_package_modules, _AbstractManager
import inspect
import asyncio
import re
import itertools
from slack_bolt.kwargs_injection import args as slack_injected_args


class ChecklistError(Exception):
    """Raised when a checklist fails"""




class _Handler:
    __slots__ = ['callback', 'checklist', 'name']

    def __init__(self, callback: Callable, **kwargs):
        self.callback = callback
        self.name = callback.__name__
        self.checklist = kwargs.get('checklist', [])

    def _should_run(self, event):
        return True if not self.checklist else all(predicate(event) for predicate in self.checklist)

    async def __call__(self, p, *args):
        if not self._should_run(p):
            return
        return await self.callback(*args)


class StartupTask(_Handler):
    pass


class SlashCommand(_Handler):
    __slots__ = ['cmd']

    def __init__(self, callback: Callable, cmd, **kwargs):
        super().__init__(callback, **kwargs)
        self.cmd = cmd

    async def __call__(self, args: slack_injected_args):
        if not self._should_run(args.payload):
            return

        self.callback(args)

class SlackHandler(_Handler):
    __slots__ = ['handler_type', 'subtype']

    def __init__(self, callback: Callable, handler_type: str, subtype=None, **kwargs):
        super().__init__(callback, **kwargs)
        self.callback = callback

        self.handler_type = handler_type
        self.subtype = subtype

    async def __call__(self, args: slack_injected_args):
        if not self._should_run(args.payload):
            return
        await self.callback(args)



class InteractionManager(_AbstractManager):

    __slots__ = ["type_mapping", "logger", "bot", "event_subtype_handlers", "event_handlers", "startup_tasks", "slash_commands"]

    def __init__(self, bot):
        super().__init__(bot)
        self.startup_tasks = []
        self.slash_commands = []
        self.event_handlers = {}
        self.event_subtype_handlers = {}

    def is_slack_handler(self, obj):
        """Check if an object is a Slack handler"""
        return isinstance(obj, SlackHandler)

    def is_startup_task(self, obj):
        return isinstance(obj, StartupTask)

    def is_slash_command(self, obj):
        return isinstance(obj, SlashCommand)

    async def setup(self, module):
        for mod in get_package_modules(module):
            self.logger.info(f"loading {mod.__name__}")
            await self.load(mod)

        regular_handlers = sum(len(handlers) for handlers in self.event_handlers.values())
        subtype_handlers = sum(
            len(handlers)
            for handler_type in self.event_subtype_handlers.values()
            for handlers in handler_type.values()
        )
        self.logger.info(f"loaded {len(self.startup_tasks)} startup task(s)...")
        self.logger.info(f"loaded {regular_handlers + subtype_handlers} slack event handlers!")
        self.logger.info(f"loaded {len(self.slash_commands)} slash commands!")

    async def load(self, module):
        module_name = module.__module__ if hasattr(module, '__module__') else module.__name__

        try:
            startup_tasks = inspect.getmembers(module, self.is_startup_task)
            for task_name, task_object in startup_tasks:
                self.startup_tasks.append(task_object)
                self.logger.debug(f"found startup task {task_object.name}")

            slash_commands = inspect.getmembers(module, self.is_slash_command)
            for command_name, command_object in slash_commands:
                self.slash_commands.append(command_object)
                self.logger.debug(f"found slash command {command_object.cmd} -> {command_object.name}")

            slack_handlers = inspect.getmembers(module, self.is_slack_handler)
            for handler_name, handler_object in slack_handlers:
                if hasattr(module, 'instance'):
                    handler_object.instance = module.instance
                
                if handler_object.subtype:
                    if handler_object.handler_type not in self.event_subtype_handlers:
                        self.event_subtype_handlers[handler_object.handler_type] = {}
                    if handler_object.subtype not in self.event_subtype_handlers[handler_object.handler_type]:
                        self.event_subtype_handlers[handler_object.handler_type][handler_object.subtype] = []
                    self.event_subtype_handlers[handler_object.handler_type][handler_object.subtype].append(handler_object)
                else:
                    if handler_object.handler_type not in self.event_handlers:
                        self.event_handlers[handler_object.handler_type] = []
                    self.event_handlers[handler_object.handler_type].append(handler_object)

                self.logger.debug(
                    f"registered {handler_object.name} on {handler_object.handler_type} ({handler_object.subtype or 'all'})"
                )

            if len(slack_handlers) > 0:
                self.logger.info(f"loaded {len(slack_handlers)} event handlers from {module_name}")

        except Exception as e:
            self.logger.error(f"error loading handlers from {module_name}: {str(e)}")
            raise

    async def handle_message(self, args):
        if args.event.get('text') is None:
            return
        
        event_subtype = args.event.get('subtype')
        
        # Run subtype-specific handlers if they exist
        if event_subtype and 'message' in self.event_subtype_handlers:
            for handler in self.event_subtype_handlers['message'].get(event_subtype, []):
                await handler(args)
        
        # Run regular message handlers
        for handler in self.event_handlers['message'] or []:
            await handler(args)
            
        await args.ack()

    def handler_function(self, typo):
        async def _handle(args):
            for handler in self.event_handlers.get(typo, []):
                await handler(args)
            await args.ack()
        return _handle


def check(predicate):
    def decorator(handler_function):
        if not hasattr(handler_function, '__checks'):
            handler_function.__checks = []

        if not type(predicate) == FunctionType:
            raise TypeError('All handler checks must be a function')

        handler_function.__checks.append(predicate)
        return handler_function
    return decorator


