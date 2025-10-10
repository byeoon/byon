import { Client, EmbedBuilder } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { getAllResourceUsage } from "../commons/utils";
import { getConfigValue } from "../events/errorDebugger";
import * as os from 'os';
import { byonVersion } from "..";

export const stats: Command = {
  name: "stats",
  description: "See my ping, uptime, total members, and more!",
  category: ShoukoCommandCategory.General,
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
    let thing = os.type();
    let osplatfomr = os.release();
    const totalGB = (os.totalmem() / (1024 * 1024 * 1024)).toFixed(1);
    const freeGB = (os.freemem() / (1024 * 1024 * 1024)).toFixed(1);

    // uptime shits
    const seconds = Math.floor(process.uptime());
    const minutes = Math.floor(seconds / 60) % 60;
    const hours = Math.floor(seconds / 3600) % 24;
    const days = Math.floor(seconds / 86400);

    const pingEmbed = new EmbedBuilder()
    .setTitle("Byon's Stats")
    .setDescription("See my ping, uptime, total members, and more!")
    .setTimestamp()
    .addFields([
      {
        name: "** 🤖 General Bot Information**",
        value: `**Latency:** ${latency}ms
        **WS Latency:** ${ws_latency}ms
        **Bot Uptime:** ${days}d ${hours}h ${minutes}m ${seconds % 60}s
        **Users on Byon:** ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b, 0)}
        **Servers on Byon:** ${client.guilds.cache.size}
        **Byon Memory Usage:** ${processUsage.rss}MB`
      },
      {
        name: "** 💻 Host Information**",
        value: `**OS:** ${thing}
        **OS Platform:** ${osplatfomr}
        **Total Memory:** ${totalGB}GB
        **Free Memory:** ${freeGB}GB
        *Self hosted with 💖*
        `
      },
      
    ])
    .setFooter({
    text: `byon v${byonVersion} `,
    iconURL: "https://cdn.discordapp.com/avatars/1309309285624451133/6f25393b9fdc30fc2b189ef7921495eb.png?size=1024"
  })
    .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.followUp({
      embeds: [pingEmbed]
    })
  }
}