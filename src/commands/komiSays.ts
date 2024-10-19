import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const komiSay: Command = {
  name: "shoukosays",
  description: "Make shouko say something! she'll say it!!",
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
      name: "text",
      description: "A string, for shouko to say",
      type: ApplicationCommandOptionType.String,
      required: true
    }
  ],
  run: async (_client: Client, interaction: ShoukoHybridCommand) => { 
    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "waawawawa"
    })
  }
}