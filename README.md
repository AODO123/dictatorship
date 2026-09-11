# Dictatorship

A small Discord bot that looks up dictionary definitions. Built for a private server.

## What it does

Type `?def <word>` in any channel and the bot replies with an embed containing:

- Part of speech
- Definitions (up to 3 per part of speech)
- Pronunciation (IPA + audio link when available)
- Usage examples

Uses the [Free Dictionary API](https://dictionaryapi.dev/) so there's no API key needed.

## Commands

| Command | Description |
|---------|-------------|
| `?def <word>` | Look up a word (also accepts `?define` and `?d`) |
| `?ping` | Check latency |
| `?help` | List commands |

## Setup

**Requirements:** Node.js 18+

1. Clone the repo
2. Install dependencies:
   ```
   npm install
   ```
3. Copy `.env.example` to `.env` and add your bot token:
   ```
   cp .env.example .env
   ```
4. Get a bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
5. Make sure your bot has the **Message Content Intent** enabled in the portal
6. Run:
   ```
   npm start
   ```

## .env

```
BOT_TOKEN=your-bot-token-here
PREFIX=?
```

The prefix defaults to `?` if not set.

## Project structure

```
dictatorship/
  src/
    bot.js          - main bot file
    dictionary.js   - dictionary API wrapper
  .env.example
  .gitignore
  package.json
```

## Author

Made by **Costa**.

## License

MIT
