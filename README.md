# shouko-san
My multi-purpose discord bot \
⚠️ (code is very :sob:)
### Key Features
* Gemini powered AI (with configurable personality) with saved conversations.
* User profile commands (avatar, banner, etc)

# Configuring the bot
* Install all dependencies beforehand: 
```bash
npm install
```
* Create a .env file in the project folder. Example of .env file:
```env
GOOGLE_API_KEY=ABCDEFGH
CLIENT_TOKEN=ABCDEFGH
```
* Modify the instructions.txt as you please, this will define the bot's personality.
* All referenced configs in the bot is in `config.json`

# Deploying the bot
On dev environment:
```bash
npm run dev
```
On production (immediately runs from dist, assuming everything has been compiled beforehand)
```bash
npm run start
```
