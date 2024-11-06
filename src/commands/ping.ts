import { ApplicationCommandOptionType, Client, EmbedBuilder } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand } from "../commons/command";
import { getAllResourceUsage } from "../commons/utils";
import { getConfigValue } from "../events/errorDebugger";

export const pingCommand: Command = {
  name: "ping",
  description: "See bot status",
  category: ShoukoCommandCategory.Misc,
  options: [
    {
      name: "ephmeral",
      description: "Incognito mode (only makes the command visible to you)",
      type: ApplicationCommandOptionType.Boolean
    }
  ],
  run: async (client: Client, interaction: ShoukoHybridCommand) => {
    let startTime = Date.now();
    await interaction.deferReply({
      ephemeral: (interaction.getOption<boolean>("ephmeral") || false)
    });

    let latency =  Date.now() - startTime;
    let ws_latency = client.ws.ping;
    let processUsage = await getAllResourceUsage();

    const pingEmbed = new EmbedBuilder()
    .setTitle("shouko's stats")
    .addFields([
      {
        name: "ping/ws",
        value: `\`${latency}/${ws_latency} ms\``
      },
      {
        name: "memory",
        value: `\`${processUsage.rss} MB\``
      },
      {
        name: "total users/guilds",
        value: `\`${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0)}/${client.guilds.cache.size}\``
      },
      {
        name: "db total messages",
        value: `\`${processUsage.dbRecordCount} messages\``
      },
      {
        name: "db queries since start",
        value: `\`${processUsage.dbQueriesSinceRestart} queries\``
      }
    ])
    .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.followUp({
      embeds: [pingEmbed],
      content: 'meow'
    })
  }
}