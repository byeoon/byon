import { ActivityType, Client } from 'discord.js'
import { Commands } from '../commands';
import { logger } from './errorDebugger';

export default (client: Client): void => {
  client.once('ready', async (client: Client) => {
    if (!client || !client.user) return;
    await client.application?.commands.set(Commands).then(() => {
      logger ("Successfully registered " + Commands.length + " Commands!")
    })
    logger ("Successfully logged in as " + client?.user?.tag);
    logger ("Guilds: " + (await client?.guilds.fetch()).toJSON())

    client.user.setPresence({
      activities: [{"name": "haii :3", type: ActivityType.Custom}],
      status: "online"
    })
  });
}