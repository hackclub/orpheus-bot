import random
import aiohttp
import orph
from orph.decorators import *
from orph.util import react_to_message, reply_in_thread, remove_reaction_from_message
from orph import transcript


async def upload_to_cdn(files):
    orph.logger.info(f"[cdn] generating links for {len(files)} file(s)")

    file_urls = [f['url_private'] for f in files]
    url = 'https://cdn.hackclub.com/api/v1/new'

    headers = {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer beans',
        'X-Download-Authorization': f"Bearer {orph.env['SLACK_BOT_TOKEN']}"
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, headers=headers, json=file_urls) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"cdn returned error {response.status}: {await response.text()}")


@listen_for("message", "file_share")
@only_in_channel(orph.env['CDN_CHANNEL'])
async def handle_cdning(args):
    message = args.payload
    files = message.get('files', [])

    try:
        ext_flavor_options = [transcript('fileShare.generic')]
        for file in files:
            try:
                ext_flavor_options.append(transcript(f"fileShare.extensions.{file['filetype']}"))
            except Exception:
                pass

        cdn_links, _, _ = await asyncio.gather(
            upload_to_cdn(files),
            reply_in_thread(message, random.choice(ext_flavor_options)),
            react_to_message(message, 'beachball')
        )

        await asyncio.wait([
            remove_reaction_from_message(args.event, 'beachball'),
            react_to_message(args.event, 'white_check_mark'),
            reply_in_thread(
                args.event,
                transcript('fileShare.success', {
                    'links': '\n'.join(cdn_links),
                    'user': message.get('user')
                }),
                unfurl_media=False,
                unfurl_links=False
            )
        ])

    except Exception as err:
        max_file_size = 100000000
        file_too_big = any(f.get('size', 0) > max_file_size for f in files)

        if file_too_big:
            await reply_in_thread(args.event, transcript('fileShare.errorTooBig'))
        else:
            await reply_in_thread(args.event, transcript('fileShare.errorGeneric'))

        await asyncio.wait([
            remove_reaction_from_message(args.event, 'beachball'),
            react_to_message(args.event, 'no_entry'),
            reply_in_thread(args.event, transcript('errors.general', {'err': str(err)}))
        ])
