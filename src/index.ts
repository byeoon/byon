import { Client, GatewayIntentBits, Partials } from 'discord.js'
import { DefaultWebSocketManagerOptions } from 'discord.js'
import ready from './events/ready';
import interactionCreate from './events/interactionCreate';
import aiwrapper from './commons/aiwrapper';
import dbManager from './commons/dbManager';
import errorHandler from './events/errorDebugger';

require("dotenv").config("../.env")

console.log("Loading ShoukoV2, attempting to connect to discord gateway");

(DefaultWebSocketManagerOptions.identifyProperties as any).browser = "Discord Android";
(DefaultWebSocketManagerOptions.identifyProperties as any).os = "shouko";
(DefaultWebSocketManagerOptions.identifyProperties as any).device = "shouko";

export const shoukoVersion = process.env.npm_package_version


const client: Client = new Client({
    intents: [		
        GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates
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
dbManager(client);

client.login(process.env.CLIENT_TOKEN);