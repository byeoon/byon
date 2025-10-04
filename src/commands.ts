
import { komiSay } from "./commands/say";
import { Command, MessageCommand, UserCommand } from "./commons/command";
import { HelpCommand } from "./commands/help";
import { guildAvatarContext, userAvatar, userAvatarContext } from "./commands/userAvatar";
import { userBanner, userBannerContext } from "./commands/userBanner";
import { userProfile, userProfileContext } from "./commands/userProfile";
import { stats } from "./commands/stats";
import { komiTalk } from "./commands/komiTalk";
import { action } from "./commands/action";
import { evilDuke } from "./commands/evilDuke";
import { neko } from "./commands/neko";
import { readifCute } from "./commands/readifcute";

export const Commands: Command[] = [
  komiTalk,
  komiSay,
  HelpCommand,
  userAvatar,
  userBanner,
  userProfile,
  stats,
  action,
  evilDuke,
  neko,
  readifCute
];

export const UserCommands: UserCommand[] = [
  userAvatarContext,
  guildAvatarContext,
  userBannerContext,
  userProfileContext
]

export const MessageCommands: MessageCommand[] = []