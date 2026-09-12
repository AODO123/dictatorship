# Dictatorship

A small Discord bot for quick dictionary definitions and message translations. Built for Costa's private server.

## Features

### 1. Dictionary (`?def <word>`)
Look up any English word with definitions, part of speech, pronunciation, and usage examples.

### 2. Translation (`.tr`)
Reply to any message with `.tr` to detect the language and translate it directly into English.

## Commands

| Command | Description |
|---------|-------------|
| `?def <word>` | Look up a word (aliases: `?define`, `?d`) |
| `.tr` | Reply to any message to translate it into English (aliases: `.translate`, `.t`) |
| `?ping` | Check latency |
| `?help` | List commands |

## Setup

**Requirements:** Node.js 18+

1. Clone the repo
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your bot token:
   ```bash
   cp .env.example .env
   ```
4. Get a bot token from the [Discord Developer Portal](https://discord.com/developers/applications)
5. Make sure your bot has the **Message Content Intent** enabled in the portal
6. Run:
   ```bash
   npm start
   ```

## .env

```env
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
    translator.js   - translation & language detection
  .env.example
  .gitignore
  package.json
```

## Author

Made by **Costa**.

## License

MIT
