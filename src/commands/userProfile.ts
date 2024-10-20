import { ApplicationCommandOptionType, ApplicationCommandType, Client, EmbedBuilder, User } from "discord.js"
import { getClan, getUserBadgesEmojis, getUsername } from "../commons/utils"
import { getConfigValue } from "../events/errorDebugger";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";
import Vibrant = require('node-vibrant');
import sharp = require("sharp");

const generateMessage = async (client: Client, interaction: ShoukoHybridCommand) => {
  let target: User;
  target = await interaction.getOption<Promise<User>>("user") || interaction.targetUser || interaction.user;

  let badges = await getUserBadgesEmojis(target, true)
  target = await client.users.fetch(target);
  let clan = await getClan(target);
  let avatar = (await target.displayAvatarURL({
    size: 4096,
    forceStatic: false
  }));

  let staticAvatar = (await target.displayAvatarURL({
    size: 512,
    forceStatic: true
  }));
  let avImageFile = Buffer.from(await (await fetch(staticAvatar)).arrayBuffer());
  var v = await new Vibrant(await sharp(avImageFile).png().toBuffer()).getPalette();

  let banner = (await target.bannerURL({
    size: 4096,
    forceStatic: false
  })) || `https://singlecolorimage.com/get/${v.Vibrant?.hex.slice(1)}/300x100.png`;
  let filteredName = (target.displayName.toLowerCase() === target.username.toLowerCase()) ? "@" + target.displayName : "@" + getUsername(target) + "  •  " + target.displayName
  let profileEmbed: EmbedBuilder = new EmbedBuilder()
  .setTitle(filteredName)
  .setDescription((badges.length > 0 ? badges.join("") + (clan ? " " : "") : "") + `${clan ? "\`\` " + clan.tag + " \`\`" : ""} `)
  .setThumbnail(avatar)
  .setImage(banner)
  .setColor(v.Vibrant?.hex || getConfigValue("EMBED_COLOR"));

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