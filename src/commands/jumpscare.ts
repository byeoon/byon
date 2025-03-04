import { Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger"

export const komiJumpscare: Command = {
  name: "jumpscare",
  description: '"Please jumpscare me, thank you", You said.',
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  run: async (_client: Client, interaction: ShoukoHybridCommand) => {
    await interaction.reply({
      content: getConfigValue("JUMPSCARE_GIFS")[Math.floor(Math.random() * getConfigValue("JUMPSCARE_GIFS").length)]
    })
  }
}