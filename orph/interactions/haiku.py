from orph.decorators import *
from pysyllables import get_syllable_count
from syllables import estimate
from num2words import num2words
import re
from orph import transcript, logger
from orph.util import react_to_message, reply_in_thread
import asyncio
import datetime


cleanup = re.compile(r'[^a-zA-Z0-9\s\.$]')

@listen_for("message")
@message_shorter_than(250)  # adjust to taste, but keep in mind this runs on every message
@only_in_channel("C0854JXKB1S")
async def haiku_interaction(args):
    message = args.message
    text = cleanup.sub('', message['text']).strip().replace('\n', ' ')
    haiku_lines = format_haiku(text)

    if len(haiku_lines) == 3:
        await asyncio.wait([
            reply_in_thread(message, transcript('haiku', {
                'haikuLines': haiku_lines,
                'user': message['user'],
                'year': datetime.date.today().year
            })),
            react_to_message(message, 'haiku')
        ])


def format_haiku(text):
    text = text.lower()
    text = text.replace('$', 'dollar ')
    text = re.sub(r'ise\b', 'ize', text)  # british people...

    def replace_num(match):
        try:
            return num2words(int(match.group()))
        except ValueError:
            return match.group()

    text = re.sub(r'\d+', replace_num, text)

    words = [word.strip() for word in re.findall(r'[\w\']+(?:[-\'][\w\']+)*', text) if word.strip()]

    line1, line2, line3 = [], [], []
    syllable_count1 = syllable_count2 = syllable_count3 = 0

    for word in words:
        try:
            # see if word in cmudict, otherwise fall back to less accurate algo
            word_syllables = get_syllable_count(word) or estimate(word)
            if syllable_count1 < 5:
                if syllable_count1 + word_syllables <= 5:
                    line1.append(word)
                    syllable_count1 += word_syllables
                else:
                    return []

            elif syllable_count2 < 7:
                if syllable_count2 + word_syllables <= 7:
                    line2.append(word)
                    syllable_count2 += word_syllables
                else:
                    return []

            elif syllable_count3 < 5:
                if syllable_count3 + word_syllables <= 5:
                    line3.append(word)
                    syllable_count3 += word_syllables
                else:
                    return []

            else:
                return []

        except Exception as e:
            logger.error(f"[haiku] processing word '{word}': {str(e)}")
            return []

    if syllable_count1 == 5 and syllable_count2 == 7 and syllable_count3 == 5:
        return [
            ' '.join(line1),
            ' '.join(line2),
            ' '.join(line3)
        ]

    return []