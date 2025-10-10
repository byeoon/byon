
import { say } from "./commands/say";
import { Command, MessageCommand, UserCommand } from "./commons/command";
import { HelpCommand } from "./commands/help";
import { guildAvatarContext, userAvatar, userAvatarContext } from "./commands/userAvatar";
import { userBanner, userBannerContext } from "./commands/userBanner";
import { userProfile, userProfileContext } from "./commands/userProfile";
import { stats } from "./commands/stats";
import { action } from "./commands/action";
import { evilDuke } from "./commands/evilDuke";
import { neko } from "./commands/neko";
import { readifCute } from "./commands/readifcute";
import { eightball } from "./commands/8ball";
import { size } from "./commands/size";
import { ping } from "./commands/ping";

export const Commands: Command[] = [
  size,
  ping,
  say,
  HelpCommand,
  userAvatar,
  userBanner,
  userProfile,
  stats,
  action,
  evilDuke,
  neko,
  readifCute,
  eightball
];

export const UserCommands: UserCommand[] = [
  userAvatarContext,
  guildAvatarContext,
  userBannerContext,
  userProfileContext
]

export const MessageCommands: MessageCommand[] = []