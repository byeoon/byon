import { ApplicationCommandOptionType, ApplicationCommandOption, Client, EmbedBuilder } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType, APIActionResult } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger";

enum Action {
  Hug = "hug",
  Cuddle = "cuddle",
  Pat = "pat",
  Kiss = "kiss",
  Slap = "slap",
  Bite = "bite",
  Shoot = "shoot",
  Yeet = "throw",
  Tickle = "tickle",
  Stare = "stare",
  Pout = "pout",
}

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
    
    const {
      results: [{ url, anime_name }],
      } = (await req.json()) as APIActionResult;

      const pingEmbed = new EmbedBuilder()
      .setTitle(anime_name)
      .setImage(url)
      .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "me when i get you",
      embeds: [pingEmbed]
    })
  }
}
