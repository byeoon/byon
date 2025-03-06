import { ApplicationCommandOptionType, ApplicationCommandOption, Client, EmbedBuilder, User } from "discord.js"
import { APIActionResult, Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger";

export const RequiredUserOption: ApplicationCommandOption = {
  name: "user",
  description: "target user",
  type: ApplicationCommandOptionType.User,
  required: true
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
        description: "💕 i need a hug",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            RequiredUserOption
        ],
    },
    {
        name: "pat",
        description: "💕 i want to pat seele",
        type: ApplicationCommandOptionType.Subcommand,
        options: [
            RequiredUserOption
        ],
    },
    {
      name: "kiss",
      description: "💕 i want to kiss seele",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
          RequiredUserOption
      ],
  },
  {
    name: "cuddle",
    description: "💕 i REALLY want to cuddle seele",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        RequiredUserOption
    ],
  },
  {
    name: "blush",
    description: "❤ me when uhhhh yea i think u get the point already",
    type: ApplicationCommandOptionType.Subcommand,
  },
  {
    name: "tickle",
    description: "💕 tee hee hee",
    type: ApplicationCommandOptionType.Subcommand,
    options: [
        RequiredUserOption
    ],
  },
  {
    name: "poke",
    description: "💕 boop",
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

    const target = interaction.getOption<User>("user");
    const action = interaction.getSubcommand();
    const req = await fetch(new URL(action + "", BASE_URLS.ACTIONS));
    let amount = 1; // will make this work soon
    
    const {
      results: [{ url, anime_name }],
      } = (await req.json()) as APIActionResult;

      const pingEmbed = new EmbedBuilder()
      .setTitle("Awwww, adorable!")
      .setDescription(`${target} has recieved ${amount} interactions!`)
      .setImage(url)
      .setFooter({
        text: 'Source: ' + anime_name
      })
      .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString() || "me when i get <@" + target + "> with my " + action,
      embeds: [pingEmbed]
    })
  }
}
