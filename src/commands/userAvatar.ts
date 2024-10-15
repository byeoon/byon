import { ApplicationCommandOptionType, ApplicationCommandType, Client, CommandInteraction, EmbedBuilder, User, UserContextMenuCommandInteraction } from "discord.js";
import { Command, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";
import { getConfigValue } from "../events/errorDebugger";
import { shoukoVersion } from "..";
import { getUsername } from "../commons/utils";

const generateMessage = async (interaction: CommandInteraction | UserContextMenuCommandInteraction) => {
  let target: User;
  if (interaction instanceof UserContextMenuCommandInteraction) {
    target = interaction.targetUser;
  } else {
    target = interaction.options.get("user")?.user || interaction.user;
  }

  let avatarEmbed = new EmbedBuilder()
  .setImage(target.displayAvatarURL({
    size: 4096,
    forceStatic: false
  }))
  .setColor(getConfigValue("EMBED_COLOR"))
  .setFooter({
    text: `${getUsername(target)}'s avatar  |  shouko v${shoukoVersion}`
  });

  await interaction.reply({
    embeds: [avatarEmbed],
    ephemeral: interaction.options.get("ephmeral")?.value as boolean ?? false
  });
}

export const userAvatar: Command = {
  name: "avatar",
  description: "Get a user's avatar",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  options: [
    {
      name: "user",
      type: ApplicationCommandOptionType.User,
      description: "The user to fetch",
      required: false
    }, {
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
  name: "Get User Avatar",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  type: ApplicationCommandType.User,
  run: async (client: Client, interaction: UserContextMenuCommandInteraction) => {
    await generateMessage(interaction);
  }
}