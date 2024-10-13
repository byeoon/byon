import { komiTalk } from "./commands/komiTalk";
import { komiJumpscare} from "./commands/komiJumpscare";
import { komiSay } from "./commands/komiSays";
import { Command } from "./commons/command";
import { komiPurge } from "./commands/komiPurge";
import { HelpCommand } from "./commands/help";
import { komiHistory } from "./commands/komiHistory";

export const Commands: Command[] = [
  komiTalk,
  komiJumpscare,
  komiSay,
  komiPurge,
  HelpCommand,
  komiHistory
];