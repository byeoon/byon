import { ApplicationCommandOptionType, ApplicationCommandType, Client, EmbedBuilder, User } from "discord.js"
import { getRawUser, getUserBadgesEmojis, getUsername } from "../commons/utils"
import { getConfigValue, logger } from "../events/errorDebugger";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";

const generateMessage = async (client: Client, interaction: ShoukoHybridCommand) => {
  let target: User;
  target = await interaction.getOption<Promise<User>>("user") || interaction.targetUser || interaction.user;

  let badges = await getUserBadgesEmojis(target, true)
  let clan = (await getRawUser(client, target) as any).clan
  logger(JSON.stringify(clan))
  let filteredName = target.displayName.toLowerCase() === target.username ? "@" + target.displayName : "@" + getUsername(target) + "  •  " + target.displayName
  let profileEmbed: EmbedBuilder = new EmbedBuilder()
  .setTitle(filteredName)
  .setDescription((badges.length > 0 ? badges.join("") + (clan ? " " : "") : "") + `${clan ? "\`\` " + clan.tag + " \`\`" : ""} `)
  .setColor(getConfigValue("EMBED_COLOR"));

  await interaction.reply({
    embeds: [profileEmbed],
    ephemeral: interaction.getOption<boolean>("ephmeral") || false
  });
}

export const userProfile: Command = {
  name: "profile",
  description: "Get a user's profile in detail.",
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

export const userProfileContext: UserCommand = {
  name: "View Profile",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  type: ApplicationCommandType.User,
  run: generateMessage
}