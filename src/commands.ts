import { komiTalk } from "./commands/komiTalk";
import { komiJumpscare} from "./commands/komiJumpscare";
import { komiSay } from "./commands/komiSays";
import { Command, MessageCommand, UserCommand } from "./commons/command";
import { komiPurge } from "./commands/komiPurge";
import { HelpCommand } from "./commands/help";
import { komiHistory } from "./commands/komiHistory";
import { userAvatar, userAvatarContext } from "./commands/userAvatar";

export const Commands: Command[] = [
  komiTalk,
  komiJumpscare,
  komiSay,
  komiPurge,
  HelpCommand,
  komiHistory,
  userAvatar
];

export const UserCommands: UserCommand[] = [
  userAvatarContext
]

export const MessageCommands: MessageCommand[] = []