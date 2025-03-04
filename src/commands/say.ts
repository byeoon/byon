import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const komiSay: Command = {
  name: "say",
  description: "Say something as Byon!",
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
      name: "text",
      description: "What to say",
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