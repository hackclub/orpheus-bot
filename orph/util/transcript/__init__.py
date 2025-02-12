import yaml
import os
import random
from typing import Any, Dict, List, Union
import re


class TranscriptError(Exception):
    pass


class Transcript:
    __slots__ = ["_transcript_data", 'logger']


    def __init__(self, logger, file=os.path.join(os.path.dirname(__file__), 'transcript.yml'), ):
        self._transcript_data = self.load_transcript(file)
        self.logger = logger

    def load_transcript(self, path) -> dict:
        """Load and parse the YAML transcript file."""
        try:
            with open(path, 'r', encoding='utf-8') as file:
                return yaml.safe_load(file)
        except Exception as e:
            self.logger.error(f"error loading transcript!: {e}")
            return {}

    def recurse_transcript(self, search_arr: List[str], transcript_obj: dict) -> Any:
        """Recursively search through the transcript object."""
        if not search_arr:
            return transcript_obj

        search_cursor = search_arr[0]
        target_obj = transcript_obj.get(search_cursor)

        if target_obj is None:
            raise TranscriptError("Transcript path not found")

        if len(search_arr) > 1:
            return self.recurse_transcript(search_arr[1:], target_obj)
        else:
            if isinstance(target_obj, list):
                return random.choice(target_obj)
            return target_obj

    def eval_transcript(self, target: str, vars: Dict[str, Any] = None) -> str:
        """
        Evaluate a transcript string with variables.
        Uses a safer string.Template-like approach instead of eval.
        """
        if vars is None:
            vars = {}

        vars['t'] = self.transcript

        def replace_var(match):
            expr = match.group(1)
            try:
                if expr.startswith('this.t('):
                    path = expr.replace('this.t(', '').replace(')', '').strip("'").strip('"')
                    return str(self.transcript(path, vars))

                if expr.startswith('this.'):
                    # Remove 'this.' prefix
                    var_expr = expr.replace('this.', '')
                    
                    # Create a safe evaluation context with only the vars
                    eval_context = {**vars}
                    try:
                        # Evaluate the expression in the restricted context
                        result = eval(var_expr, {"__builtins__": {}}, eval_context)
                        return str(result)
                    except Exception:
                        return str(vars.get(var_expr, ''))

                # Handle other variables
                return str(vars.get(expr, ''))
            except Exception as e:
                return f"[Error: {str(e)}]"

        # Replace ${...} expressions
        result = re.sub(r'\${(.*?)}', replace_var, target)
        return result

    def hydrate_obj(self, obj: Any, vars: Dict[str, Any] = None) -> Any:
        """Hydrate an object by evaluating its string values."""
        if vars is None:
            vars = {}

        if obj is None:
            return None

        if isinstance(obj, str):
            return self.eval_transcript(obj, vars)

        if isinstance(obj, list):
            return [self.hydrate_obj(item, vars) for item in obj]

        if isinstance(obj, dict):
            return {key: self.hydrate_obj(value, vars) for key, value in obj.items()}

        return obj

    def transcript(self, search: str, vars: Dict[str, Any] = None) -> Any:
        """Main transcript function to search and hydrate text."""
        if vars:
            self.logger.debug(f'I\'m searching for words in my yaml file under "{search}". '
                  f'These variables are set: {vars}')
        else:
            self.logger.debug(f'I\'m searching for words in my yaml file under "{search}"')

        search_arr = search.split('.')
        transcript_obj = self._transcript_data
        dehydrated_target = self.recurse_transcript(search_arr, transcript_obj)
        return self.hydrate_obj(dehydrated_target, vars)

    __call__ = transcript