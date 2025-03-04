import { ApplicationCommandOptionType, ApplicationCommandOption, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"


export const RequiredUserOption: ApplicationCommandOption = {
  name: "user",
  description: "target user",
  type: ApplicationCommandOptionType.User,
};
  
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
            RequiredUserOption
        ],
    },
    {
        name: "pat",
        description: "i want to pat seele",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            RequiredUserOption
        ],
    },
    
  ],
  run: async (_client: Client, interaction: ShoukoHybridCommand) => { 
    const BASE_URLS = {
      ACTIONS: "https://nekos.best/api/v2/",
    };
    const target = interaction.getOption<ApplicationCommandOptionType.User>("user");
    const action = interaction.getOption<string>("act")!;
    const req = await fetch(new URL(action, BASE_URLS.ACTIONS));
    
    const message = _client
      .getString(`ACTIONS_MESSAGES_${action.toUpperCase()}`)
      ?.replaceAll("{a}", `<@${interaction.user.id}>`)
      .replaceAll("{b}", `<@${target.id}>`);

    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "me when i get you"
    })
  }
}
