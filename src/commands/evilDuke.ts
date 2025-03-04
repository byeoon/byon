import { Client, EmbedBuilder } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger"



export const evilDuke: Command = {
  name: "middlefingerpenguinvirus",
  description: "java duke",
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  run: async (_client: Client, interaction: ShoukoHybridCommand) => {
    await interaction.deferReply({
        ephemeral: (false)
      });
  
    const pingEmbed = new EmbedBuilder()
    .setTitle("he is.... everywhere.")
    .setImage("https://media1.tenor.com/m/JNrPF3XuHXIAAAAd/java-duke.gif")
    .setColor(getConfigValue("EMBED_COLOR"));


    await interaction.followUp({
        embeds: [pingEmbed],
        content: 'meow'
      })
  }
}