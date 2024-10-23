import { komiTalk } from "./commands/komiTalk";
import { komiJumpscare} from "./commands/komiJumpscare";
import { komiSay } from "./commands/komiSays";
import { Command, MessageCommand, UserCommand } from "./commons/command";
import { komiPurge } from "./commands/komiPurge";
import { HelpCommand } from "./commands/help";
import { komiHistory } from "./commands/komiHistory";
import { guildAvatarContext, userAvatar, userAvatarContext } from "./commands/userAvatar";
import { userBanner, userBannerContext } from "./commands/userBanner";
import { userProfile, userProfileContext } from "./commands/userProfile";
import { indexer } from "./commands/indexer";

export const Commands: Command[] = [
  komiTalk,
  komiJumpscare,
  komiSay,
  komiPurge,
  HelpCommand,
  komiHistory,
  userAvatar,
  userBanner,
  userProfile,
  indexer
];

export const UserCommands: UserCommand[] = [
  userAvatarContext,
  guildAvatarContext,
  userBannerContext,
  userProfileContext
]

export const MessageCommands: MessageCommand[] = []