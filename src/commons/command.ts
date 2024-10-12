import { ApplicationIntegrationType, AutocompleteInteraction, ChatInputApplicationCommandData, Client, CommandInteraction, IntegrationType, InteractionContextType, Message, MessageReplyOptions } from "discord.js";

export interface Command extends ChatInputApplicationCommandData {
  run: (client: Client, interaction: CommandInteraction) => void,
  autocomplete?: (client: Client, interaction: AutocompleteInteraction) => void
}
export const UniversalContextType: InteractionContextType[] = [
  InteractionContextType.BotDM,
  InteractionContextType.Guild,
  InteractionContextType.PrivateChannel
]

export const UniversalIntegrationType: ApplicationIntegrationType[] = [
  ApplicationIntegrationType.GuildInstall,
  ApplicationIntegrationType.UserInstall
]

export const TranslateApplicationCommandOptionType: object = {
  "1": "Subcommand",
  "2": "SubcommandGroup",
  "3": "String",
  "4": "Integer",
  "5": "Boolean",
  "6": "User",
  "7": "Channel",
  "8": "Role",
  "9": "Mentionable",
  "10": "Number",
  "11": "Attachment"
}