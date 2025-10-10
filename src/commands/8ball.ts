import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const eightball: Command = {
  name: "8ball",
  description: "What will the mystical 8-ball tell you today?",
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
      name: "question",
      description: "What do you want to ask?",
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