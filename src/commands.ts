import { komiJumpscare} from "./commands/jumpscare";
import { komiSay } from "./commands/say";
import { Command, MessageCommand, UserCommand } from "./commons/command";
import { HelpCommand } from "./commands/help";
import { guildAvatarContext, userAvatar, userAvatarContext } from "./commands/userAvatar";
import { userBanner, userBannerContext } from "./commands/userBanner";
import { userProfile, userProfileContext } from "./commands/userProfile";
import { pingCommand } from "./commands/ping";
import { komiTalk } from "./commands/komiTalk";
import { action } from "./commands/action";
import { evilDuke } from "./commands/evilDuke";
import { neko } from "./commands/neko";

export const Commands: Command[] = [
  komiJumpscare,
  komiTalk,
  komiSay,
  HelpCommand,
  userAvatar,
  userBanner,
  userProfile,
  pingCommand,
  action,
  evilDuke,
  neko
];

export const UserCommands: UserCommand[] = [
  userAvatarContext,
  guildAvatarContext,
  userBannerContext,
  userProfileContext
]

export const MessageCommands: MessageCommand[] = []