import { ActivityType, Client, OAuth2Guild } from 'discord.js'
import { Commands, MessageCommands, UserCommands } from '../commands';
import { logger } from './errorDebugger';

export default (client: Client): void => {
  client.once('ready', async (client: Client) => {
    if (!client || !client.user) return;
    await client.application?.commands.set([...Commands, ...UserCommands, ...MessageCommands]).then(() => {
      logger ("Successfully registered " + Commands.length + " Slash Commands, " + UserCommands.length + " User Context Commands, " +  MessageCommands.length + " Message Context Commands!")
      logger ("Total commands: " + [...Commands, ...UserCommands, ...MessageCommands].length);
    });
    let guilds = (await client?.guilds.fetch()).toJSON();
    logger ("Successfully logged in as " + client?.user?.tag);
    logger ("Guilds (" + guilds.length + "): " + guilds.map(g => g.name).join(", "))
    logger ("Total approx installed users: " + client.application?.approximateUserInstallCount?.toString())

    client.user.setPresence({
      activities: [{"name": "haii :3", type: ActivityType.Custom}],
      status: "online"
    })
  });
}