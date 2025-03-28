import { Client, EmbedBuilder } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { getAllResourceUsage } from "../commons/utils";
import { getConfigValue } from "../events/errorDebugger";

export const stats: Command = {
  name: "stats",
  description: "See ping and other statistics",
  category: ShoukoCommandCategory.Misc,
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (client: Client, interaction: ShoukoHybridCommand) => {
    let startTime = Date.now();
    await interaction.deferReply({
      ephemeral: (false)
    });

    let latency =  Date.now() - startTime;
    let ws_latency = client.ws.ping;
    let processUsage = await getAllResourceUsage();

    const pingEmbed = new EmbedBuilder()
    .setTitle(">BYON_STATS")
    .setDescription("I'm open source!")
    .addFields([
      {
        name: "ping/ws",
        value: `\`${latency}/${ws_latency} ms\``
      },
      {
        name: "memory",
        value: `\`${processUsage.rss} mb\``
      },
      {
        name: "total users/guilds",
        value: `\`${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0)}/${client.guilds.cache.size}\``
      }
    ])
    .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.followUp({
      embeds: [pingEmbed]
    })
  }
}