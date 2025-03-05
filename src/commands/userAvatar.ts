import { ApplicationCommandOptionType, ApplicationCommandType, ApplicationIntegrationType, Client, EmbedBuilder, GuildMember, InteractionContextType, User } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";
import { getConfigValue, logger } from "../events/errorDebugger";
import { shoukoVersion } from "..";
import { getUsername } from "../commons/utils";

const generateMessage = async (_client: Client, interaction: ShoukoHybridCommand) => {
  let target: User | GuildMember;
  let guildProfile: boolean = (interaction.inGuild() && interaction.getOption<boolean>("guild")) || (interaction.inGuild() && interaction.isUserContextMenu()) || false;
  target = await interaction.getOption<Promise<User>>("user") || interaction.targetUser || interaction.user;
  try {
    if (guildProfile) target = await interaction.guild!.members.fetch(target.id)!;
  } catch(err: any) {
    logger ('[SlashCommands/UserAvatar] ' + err);
    throw new Error("No member found or must be in a guild to use this command.")
  }


  let avatarURL = target.displayAvatarURL({
    size: 4096,
    forceStatic: false
  })
  let avatarEmbed = new EmbedBuilder()
  .setTitle(`${getUsername(target)}'s avatar`)
  .setImage(avatarURL)
  .setURL(avatarURL)
  .setColor(getConfigValue("EMBED_COLOR"))
  .setFooter({
    text: `byon v${shoukoVersion}`
  });

  await interaction.reply({
    embeds: [avatarEmbed],
    ephemeral: interaction.getOption<boolean>("ephmeral") ?? false
  });
}

export const userAvatar: Command = {
  name: "avatar",
  description: "Get a user's avatar and (optionally) their guild avatar",
  category: ShoukoCommandCategory.General,
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  options: [
    {
      name: "user",
      type: ApplicationCommandOptionType.User,
      description: "The user to fetch",
      required: false
    },
    {
      name: "guild",
      type: ApplicationCommandOptionType.Boolean,
      description: "Show user profile or guild profile?"
    }, 
    {
      name: "ephmeral",
      type: ApplicationCommandOptionType.Boolean,
      description: "Incognito mode (only makes the command visible to you)",
      required: false
    }
  ],
  run: generateMessage
}

export const userAvatarContext: UserCommand = {
  name: "View Avatar",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  type: ApplicationCommandType.User,
  run: generateMessage
}

export const guildAvatarContext: UserCommand = {
  name: "View Server Avatar",
  contexts: [InteractionContextType.Guild],
  integrationTypes: [ApplicationIntegrationType.GuildInstall],
  type: ApplicationCommandType.User,
  run: generateMessage
}