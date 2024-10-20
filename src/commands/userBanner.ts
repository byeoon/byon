import { ApplicationCommandOptionType, ApplicationCommandType, Client, EmbedBuilder, User } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";
import { getConfigValue } from "../events/errorDebugger";
import { shoukoVersion } from "..";
import { getUsername } from "../commons/utils";

const generateMessage = async (client: Client, interaction: ShoukoHybridCommand) => {
  let target: User;
  target = await interaction.getOption<Promise<User>>("user") || interaction.targetUser || interaction.user;

  target = await client.users.fetch(target);


  let bannerURL = target.bannerURL({
    size: 4096,
    forceStatic: false
  }) as string | null
  let bannerEmbed = new EmbedBuilder()
  .setTitle(`${getUsername(target)}'s banner`)
  .setImage(bannerURL)
  .setURL(bannerURL)
  .setColor(getConfigValue("EMBED_COLOR"))
  .setFooter({
    text: `shouko v${shoukoVersion}`
  });

  if (!bannerURL) {
    await interaction.reply({
      content: "The specified user does not have a profile banner",
      ephemeral: interaction.getOption<boolean>("ephmeral") ?? false
    });
    return;
  }

  await interaction.reply({
    embeds: [bannerEmbed],
    ephemeral: interaction.getOption<boolean>("ephmeral") ?? false
  });
}

export const userBanner: Command = {
  name: "banner",
  description: "Get a user's profile banner.",
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
      name: "ephmeral",
      type: ApplicationCommandOptionType.Boolean,
      description: "Incognito mode (only makes the command visible to you)",
      required: false
    }
  ],
  run: generateMessage
}

export const userBannerContext: UserCommand = {
  name: "View Banner",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  type: ApplicationCommandType.User,
  run: generateMessage
}