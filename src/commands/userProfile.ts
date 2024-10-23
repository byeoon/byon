import { ApplicationCommandOptionType, ApplicationCommandType, Client, EmbedBuilder, GuildMember, User } from "discord.js"
import { getClan, getRawMember, getUserBadgesEmojis, getUsername, RawMemberData } from "../commons/utils"
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
      name: "Account created",
      value: getRelativeTimestring(target.createdTimestamp)
    }
  ]);

  if (!interaction.getOption<boolean>("guild") && interaction.inGuild()) {
    let targetMember: GuildMember | undefined = await interaction.guild?.members.fetch(target);

    if (targetMember) {
      let rawTargetMember: RawMemberData | undefined = await getRawMember(client, targetMember);
      let roles = targetMember.roles.cache.map((role) => {
        if (role.id !== interaction.guild?.roles.everyone.id) return `<@&${role.id}>`
      }).slice().reverse()

      avatar = targetMember.displayAvatarURL({
        size: 4096,
        forceStatic: false,
      });
      staticAvatar = targetMember.displayAvatarURL({
        size: 4096,
        forceStatic: true
      });

      if (rawTargetMember && rawTargetMember.banner) {
        banner = `https://cdn.discordapp.com/guilds/${interaction.guild?.id}/users/${targetMember.id}/banners/${rawTargetMember.banner}${rawTargetMember.banner.startsWith("a_") ? ".gif" : ".webp"}?size=4096&dynamic=true`
      }

      profileEmbed.addFields([
        {
          name: "Joined at",
          value: targetMember.joinedTimestamp ? getRelativeTimestring(targetMember.joinedTimestamp || 0) : "None"
        },
        {
          name: "Roles",
          value: `${roles.length > 0 ? roles.join(" ") : ""}` + " @everyone"
        }
      ])
    }
  }

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
      name: "guild",
      type: ApplicationCommandOptionType.Boolean,
      description: "Show user profile or guild profile? (default true)"
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