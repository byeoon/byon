import { Client, CommandInteraction } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { purgeChatHistory } from "../commons/dbManager";
import { makeErrorMessage } from "../events/errorDebugger";

export const komiPurge: Command = {
  name: "historypurge",
  description: "Makes shouko forget you.. No, really..",
  category: ShoukoCommandCategory.Shouko,
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (_client: Client, interaction: CommandInteraction | ShoukoHybridCommand) => {
    let res: string
    let _success = await purgeChatHistory(interaction.user.id);
    if (!_success) {
      res = makeErrorMessage("Failed to purge, check logs");
    } else {
      res = "Successfully **purged** our chat history, goodbye! ^^";
    }

    await interaction.reply({content: res, ephemeral: true})
  }
}