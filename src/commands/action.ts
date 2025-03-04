import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"


export const truncateString = (str: string, maxLength: number): string => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + '...';
    }
    return str;
  }
  
export const action: Command = {
  name: "act",
  description: "action,,,",
  category: ShoukoCommandCategory.Acts,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
        name: "hug",
        description: "i need a hug",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "user",
                description: "user to hug",
                type: ApplicationCommandOptionType.User,
                required: true,
            }
        ],
    },
    {
        name: "pat",
        description: "i want to pat seele",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            {
                name: "user",
                description: "user to pat",
                type: ApplicationCommandOptionType.User,
                required: true,
            }
        ],
    },
    
  ],
  run: async (_client: Client, interaction: ShoukoHybridCommand) => { 
    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "me when i get you"
    })
  }
}