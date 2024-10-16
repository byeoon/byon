import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction, EmbedBuilder, GuildMember, InteractionContextType, User, UserContextMenuCommandInteraction } from "discord.js";
import { Command, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";
import { getConfigValue } from "../events/errorDebugger";
import { shoukoVersion } from "..";
import { getUsername } from "../commons/utils";

const generateMessage = async (interaction: CommandInteraction | UserContextMenuCommandInteraction, _guildProfile?: boolean) => {
  let target: User | GuildMember;
  let guildProfile: boolean;
  if (interaction instanceof UserContextMenuCommandInteraction) {
    target = interaction.targetUser;
    guildProfile = _guildProfile ?? interaction.options.get("server_profile")?.value as boolean;
    if (guildProfile) target = interaction.targetMember as GuildMember;
  } else {
    target = interaction.options.get("user")?.user || interaction.user;
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
    text: `shouko v${shoukoVersion}`
  });

  await interaction.reply({
    embeds: [avatarEmbed],
    ephemeral: interaction.options.get("ephmeral")?.value as boolean ?? false
  });
}

export const userAvatar: Command = {
  name: "avatar",
  description: "View a user's avatar and (optionally) their guild avatar",
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
      name: "server_profile",
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
  run: async (client: Client, interaction: CommandInteraction) => {
    await generateMessage(interaction);
  }
}

export const userAvatarContext: UserCommand = {
  name: "View User Avatar",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  type: ApplicationCommandType.User,
  run: async (client: Client, interaction: UserContextMenuCommandInteraction) => {
    await generateMessage(interaction, false);
  }
}

export const guildAvatarContext: UserCommand = {
  name: "View Server Avatar",
  contexts: [InteractionContextType.Guild],
  integrationTypes: UniversalIntegrationType,
  type: ApplicationCommandType.User,
  run: async (client: Client, interaction: UserContextMenuCommandInteraction) => {
    await generateMessage(interaction, true);
  }
}