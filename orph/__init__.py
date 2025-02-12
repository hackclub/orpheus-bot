import pkgutil
import logging
import importlib
from abc import ABC, abstractmethod
from collections import defaultdict
import os

def get_package_modules(package):
    package_modules = []
    for importer, module_name, is_package in pkgutil.iter_modules(package.__path__):
        full_module_name = f'{package.__name__}.{module_name}'
        subpackage_object = importlib.import_module(full_module_name, package=package.__path__)
        if is_package:
            sub_package_modules = get_package_modules(subpackage_object)

            package_modules = package_modules + sub_package_modules
        package_modules.append(subpackage_object)
    return package_modules

class _AbstractManager:
    def __init__(self, bot):
        self.bot = bot
        self.logger = logging.getLogger('orpheus')

    @abstractmethod
    async def setup(self, module):
        """Setup manager class"""

    @abstractmethod
    async def load(self, module):
        """Loads entries from module"""


i = logger = slack_client = transcript = None

env = defaultdict(type(None))
env |= os.environ