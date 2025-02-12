from orph.orpheus import Orpheus
import argparse
import asyncio
import logging

if __name__ == '__main__':
    logger = logging.getLogger('orpheus')
    parser = argparse.ArgumentParser(description='run the dinosaur!')
    parser.add_argument('-s', '--socket-mode', action='store_true', help='interact with Slack in socket mode')
    parser.add_argument('-d', '--load-dotenv', action='store_true', help='load .env?')
    parser.add_argument('-p', '--port', action='store', help='port to run on')
    parser.add_argument('-l', '--logging-level', action='store',
                               default='INFO',
                               dest='logging_level',
                               help='Logging level')
    args = parser.parse_args()

    if args.load_dotenv:
        from dotenv import load_dotenv
        load_dotenv()

    inst = Orpheus(args)
    try:
        asyncio.run(inst.start())

    except KeyboardInterrupt:
        logger.info('Shutting down...')
