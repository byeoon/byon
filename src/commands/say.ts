import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger";

export const say: Command = {
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
     if (!(getConfigValue("WHITELISTED_USERS") as Array<string>).includes(interaction.user.id))
      return await interaction.reply({ content: "you can't access this command get 403 forbidden'd"});
    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString()
    })
  }
}