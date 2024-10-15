import { ApplicationIntegrationType, InteractionContextType, ApplicationCommandOptionType, Client, CommandInteraction } from "discord.js"
import { Command, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const komiSay: Command = {
  name: "shouko_says",
  description: "Make shouko say something! she'll say it!!",
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
  run: async (client: Client, interaction: CommandInteraction) => {
    await interaction.reply({
      content: interaction.options.get("text")?.value?.toString() || "waawawawa"
    })
  }
}