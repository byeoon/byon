import { ApplicationCommandOptionType, ApplicationCommandOption, Client, EmbedBuilder, User } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger";

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
 //   const BASE_URLS = {
  //    ACTIONS: "https://nekos.best/api/v2/",
   // };

    const target = interaction.getOption<User>("user");
    const action = interaction.getOption<string>("act")!;
  //  const req = await fetch(new URL(action, BASE_URLS.ACTIONS));
    
   // const {
  //    results: [{ url, anime_name }],
   //   } = (await req.json()) as APIActionResult;
    //  console.log(req.json);

      const pingEmbed = new EmbedBuilder()
      .setTitle("e")
      .setImage("https://cdn.discordapp.com/avatars/485749822322769920/06a8ae0cc26d6dd5e0c9fc41c27689d2.png?size=1024")
      .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "me when i get " + target + " with my " + action,
      embeds: [pingEmbed]
    })
  }
}
