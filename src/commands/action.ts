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
  category: ShoukoCommandCategory.General,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  // i want to hug pat kiss cuddle seele i love her
  // i have to make it a comment because gotta step up bot professionality :(
  options: [
    {
      name: "hug",
      description: "💕 Give somebody a hug!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        RequiredUserOption
      ],
    },
    {
      name: "pat",
      description: "💕 Give somebody a headpat!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        RequiredUserOption
      ],
    },
    {
      name: "kiss",
      description: "💕 Give somebody a kiss!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        RequiredUserOption
      ],
    },
    {
      name: "cuddle",
      description: "💕 Cuddle somebody!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        RequiredUserOption
      ],
    },
    {
      name: "tickle",
      description: "💕 Tickle somebody!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        RequiredUserOption
      ],
    },
    {
      name: "poke",
      description: "💕 Boop someone!",
      type: ApplicationCommandOptionType.Subcommand,
      options: [
        RequiredUserOption
      ],
    },
    {
      name: "blush",
      description: "Blush!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "facepalm",
      description: "Facepalm..!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "cry",
      description: "Aww, why are you crying? ☹️",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "dance",
      description: "Start dancing!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "lurk",
      description: "Don't mind me, I'm just lurking!",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "stare",
      description: "I see you.",
      type: ApplicationCommandOptionType.Subcommand,
    },
    {
      name: "handhold",
      description: "💕 How romantical!",
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
    const victim = interaction.getUser(); // idfk what to call it
    const action = interaction.getSubcommand();
    const req = await fetch(new URL(action + "", BASE_URLS.ACTIONS));
    let amount = 1; // will make this work soon

    const actionDialogues: Record<string, string> = {
      hug: `${victim} is giving a big hug to ${target}`,
      pat: `${victim} is giving a nice headpat to ${target}`,
      kiss: `${victim} just gave ${target} a big kiss!`,
      cuddle: `${victim} is cuddling up with ${target}, aww!!`,
      tickle: `${victim} is tickling ${target}, tee hee hee!`,
      poke: `${victim} just poked ${target}!`,
      blush: `${victim} is blushing! How cute!`,
      facepalm: `${victim} just facepalmed.. bruh.`,
      cry: `${victim} is crying... sigh.. <:sadcat:1426025555878215771>`,
      dance: `${victim} is dancing! Nice moves!`,
      lurk: `${victim} is lurking... shhh...`,
      stare: `${victim} is giving an ice cold stare.`,
      handhold: `${victim} is holding hands with ${target}.. woah <:blushold:1309538510402752512>`
    };

    const subcommand = interaction.getSubcommand() ?? "hug"; // if it goes wrong (99.9% chance it wont)
    const dialogue = actionDialogues[subcommand];

    const {
      results: [{ url, anime_name }],
    } = (await req.json()) as APIActionResult;

    const pingEmbed = new EmbedBuilder()
      .setDescription(` **${dialogue}** \n \n *${target} has recieved ${amount} ${action}(s)!*`)
      .setImage(url)
      .setFooter({
        text: 'Source: ' + anime_name
      })
      .setColor(getConfigValue("EMBED_COLOR"));

    const embedSolo = new EmbedBuilder()
      .setDescription(`**${dialogue}`)
      .setImage(url)
      .setFooter({
        text: 'Source: ' + anime_name
      })
      .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.reply({
      content: interaction.getOption<string>("text")?.toString(),
      embeds: [target === null ? embedSolo : pingEmbed],
    });
  }
}