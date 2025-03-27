from orph.decorators import *
from pysyllables import get_syllable_count
from syllables import estimate
from num2words import num2words
import re
from orph import transcript, logger
from orph.util import react_to_message, reply_in_thread
from orph.decorators import slash_command
import asyncio
import datetime


cleanup = re.compile(r'[^a-zA-Z0-9\s\.$]')

FILE = '/data/haiku_blacklist.txt'

def is_blacklisted(user_id):
    unbreak()
    try:
        with open(FILE, 'r') as f:
            blacklisted = {line.strip() for line in f if line.strip()}
        return user_id in blacklisted
    except FileNotFoundError:
        return False

import os

def unbreak():
    if not os.path.exists(FILE):
        with open(FILE, 'w') as f:
            pass

@listen_for("message")
@message_shorter_than(250)  # adjust to taste, but keep in mind this runs on every message
async def haiku_interaction(args):
    message = args.message
    user_id = message['user']

    if is_blacklisted(user_id):
        logger.info(f"[haiku] user {user_id} is on blacklist")
        return

    text = cleanup.sub('', message['text']).strip().replace('\n', ' ')
    haiku_lines = format_haiku(text)

    if len(haiku_lines) == 3:
        await asyncio.wait([
            reply_in_thread(message, transcript('haiku', {
                'haikuLines': haiku_lines,
                'user': user_id,
                'year': datetime.date.today().year
            })),
            react_to_message(message, 'haiku')
        ])

@slash_command('/haiku_opt')
async def toggle_haiku_opt_out(args):
    unbreak()
    user_id = args.payload['user_id']

    try:
        with open(FILE, 'r') as f:
            blacklisted = {line.strip() for line in f if line.strip()}

        if user_id in blacklisted:
            blacklisted.remove(user_id)
            message = ":noted: oki! if i detect a haiku i will let you know!"
        else:
            blacklisted.add(user_id)
            message = ":noted: aww oki, i wont bother you anymore if you send a really cool haiku..."

        with open(FILE, 'w') as f:
            f.write('\n'.join(blacklisted) + '\n')

        await args.respond(message)

    except Exception as e:
        logger.error(f"[haiku] could not set opt status {user_id}: {str(e)}")
        await args.respond(":confused-dino: uhh somehow i could not do that as something on the backend goofed up, pls report the bug!")

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