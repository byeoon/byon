import { Client, GatewayIntentBits, Partials, REST } from 'discord.js'
import { DefaultWebSocketManagerOptions } from 'discord.js'
import ready from './events/ready';
import interactionCreate from './events/interactionCreate';
import aiwrapper from './commons/aiwrapper';
import dbManager from './commons/dbManager';
import errorHandler, { logger } from './events/errorDebugger';
import messageCreate from './events/messageCreate';
import utils from './commons/utils';

require("dotenv").config("../.env");

console.log("[Byon] Attempting to connect to discord gateway");

(DefaultWebSocketManagerOptions.identifyProperties as any).browser = "Discord Desktop";
(DefaultWebSocketManagerOptions.identifyProperties as any).os = "byon";
(DefaultWebSocketManagerOptions.identifyProperties as any).device = "byon";

export const byonVersion = process.env.npm_package_version
export const prefix = "b!"


const client: Client = new Client({
  intents: [		
    GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages
  ],
  partials: [
    Partials.Channel,
    Partials.User
  ]
})

ready(client);
errorHandler(client);
aiwrapper(client);
interactionCreate(client);
messageCreate(client);
dbManager(client, "shoukoDatabase.db");
utils(client)

export const restClient = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN!);
client.login(process.env.CLIENT_TOKEN).catch(err => logger("Unable to log in: " + err));