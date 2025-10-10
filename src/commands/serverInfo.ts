import { ApplicationCommandOptionType, ApplicationCommandType, Client, EmbedBuilder, GuildMember, User } from "discord.js"
import { getClan, getUserBadgesEmojis, getUsername } from "../commons/utils"
import { getConfigValue } from "../events/errorDebugger";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType, UserCommand } from "../commons/command";
import Vibrant = require('node-vibrant');
import sharp = require("sharp");

const getRelativeTimestring = (timestamp: number): string => {
  let roundedTimestamp: number = Math.floor(timestamp / 1000);
  return `<t:${roundedTimestamp}>\n(<t:${roundedTimestamp}:R>)`
}

const generateMessage = async (client: Client, interaction: ShoukoHybridCommand) => {
  let target: User | GuildMember;
  target = await interaction.getOption<Promise<User>>("user") || interaction.targetUser || interaction.user;

  let badges = await getUserBadgesEmojis(target, true)
  target = await client.users.fetch(target.id, {force: true});

  let clan = await getClan((target instanceof GuildMember) ? target.user : target);
  let avatar = (target.displayAvatarURL({
    size: 4096,
    forceStatic: false
  }));

  let staticAvatar = (target.displayAvatarURL({
    size: 512,
    forceStatic: true
  }));

  let banner = (target.bannerURL({
    size: 4096,
    forceStatic: false
  }));
  let filteredName = "@" + getUsername(target) + " (" + target.id + ")"

  let profileEmbed: EmbedBuilder = new EmbedBuilder()
  .addFields([
    {
      name: "Display Name",
      value: target.displayName
    },
    {
      name: "Account Created",
      value: getRelativeTimestring(target.createdTimestamp)
    },
    {
      name: "Token",
      value: "" + btoa(target.id) + ".#####.[REDACTED]"
    }
  ]);

  let avImageFile = Buffer.from(await (await fetch(staticAvatar)).arrayBuffer());
  var v = await new Vibrant(await sharp(avImageFile).png().toBuffer()).getPalette();

  profileEmbed
  .setTitle(filteredName)
  .setDescription((badges.length > 0 ? badges.join("") + (clan ? "  " : "") : "") + `${clan ? "\`\` " + clan.tag + " \`\`" : ""} `)
  .setThumbnail(avatar)
  .setImage(banner || `https://singlecolorimage.com/get/${v.Vibrant?.hex.slice(1)}/300x100.png`)
  .setURL("https://discord.com/users/" + target.id)
  .setColor(v.LightVibrant?.hex || getConfigValue("EMBED_COLOR"));
  

  await interaction.reply({
    embeds: [profileEmbed],
    ephemeral: false
  });
}

export const serverProfile: Command = {
  name: "server",
  description: "Get server information in detail.",
  category: ShoukoCommandCategory.General,
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  options: [
    {
      name: "guildId",
      type: ApplicationCommandOptionType.String,
      description: "The server to fetch",
      required: false
    },
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