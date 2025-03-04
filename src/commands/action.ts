import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"


export const truncateString = (str: string, maxLength: number): string => {
    if (str.length > maxLength) {
        return str.slice(0, maxLength - 3) + '...';
    }
    return str;
  }
  
  const sanitizer = (text: string): string => {
    return truncateString(text
    .replace(/(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu, "")
    .replace(/([!-\+;-@[-`])|(\r\n|\r|\n)+/g, "")
    .replace(/( [\s]+|[\s]+$)+/g, " ")
    .replace(":3", ":>")
    .trim(), 105);
  }

  
export const komiSay: Command = {
  name: "act hug",
  description: "give someone a hug (i need one)",
  category: ShoukoCommandCategory.Acts,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
        name: "user",
        description: "Who to act on",
        type: ApplicationCommandOptionType.User,
        required: true
    }
  ],
  run: async (_client: Client, interaction: ShoukoHybridCommand) => { 
    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "waawawawa"
    })
  }
}