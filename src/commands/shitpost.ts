import { ApplicationCommandOptionType, Client, EmbedBuilder } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger"

export const shitpost: Command = {
  name: "shitpost",
  description: "Send one of my one-lined memes, too small to make a command of their own",
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
      name: "shitpost",
      description: "Which shitpost to send",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
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
        content: 'java duke emote here but im lazy' 
      })
  }
}