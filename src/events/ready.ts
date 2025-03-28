import { ActivityType, Client } from 'discord.js'
import { Commands, MessageCommands, UserCommands } from '../commands';
import { logger } from './errorDebugger';

const presenceRefresh = async (client: Client) => {
  client.user?.setPresence({
    activities: [{"name": "being the best • b!help", type: ActivityType.Competing}],
    status: "online"
  })
}

export default (client: Client): void => {
  client.once('ready', async (client: Client) => {
    if (!client || !client.user) return;
    await client.application?.commands.set([...Commands, ...UserCommands, ...MessageCommands]).then(() => {
      logger ("Successfully registered " + Commands.length + " Slash Commands, " + UserCommands.length + " User Context Commands, " +  MessageCommands.length + " Message Context Commands!")
      logger ("Total commands: " + [...Commands, ...UserCommands, ...MessageCommands].length);
    });
    let guilds = (await client?.guilds.fetch());
  //  let users = (await client?.users.fetch(client?.users.resolveId()));
    logger ("Successfully logged in as " + client?.user?.tag);
    logger ("Guilds (" + guilds.toJSON().length + "): " + guilds.map(g => g.name).join(", "));
  //  logger ("Users (" + users + ")");

    await presenceRefresh(client);
    setInterval(async () => await presenceRefresh(client), 60_000)
  });
}