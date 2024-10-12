import { Client, CommandInteraction, InteractionContextType } from "discord.js";
import { Command, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { purgeChatHistory } from "../commons/dbManager";
import { makeErrorMessage } from "../events/errorDebugger";

export const komiPurge: Command = {
  name: "purge_my_chat_history",
  description: "Makes shouko forget you.. No, really..",
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (client: Client, interaction: CommandInteraction) => {
    let res: string
    let _success = await purgeChatHistory(interaction.user.id);
    if (!_success) {
      res = makeErrorMessage("Failed to purge, check logs");
    } else {
      res = "Successfully purged our chat history, goodbye!";
    }

    await interaction.reply({content: res, ephemeral: true})
  }
}