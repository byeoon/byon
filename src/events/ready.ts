import { ActivityType, Client } from 'discord.js'
import { Commands } from '../commands';

export default (client: Client): void => {
  client.once('ready', async (client: Client) => {
    if (!client || !client.user) return;
    await client.application?.commands.set(Commands).then(() => {
      console.log("Successfully registered " + Commands.length + " Commands!")
    })
    console.log("Successfully logged in as " + client?.user?.tag);
    console.log("Guilds: " + (await client?.guilds.fetch()).toJSON())

    client.user.setPresence({
      activities: [{"name": "haii :3", type: ActivityType.Custom}],
      status: "online"
    })
  });
}