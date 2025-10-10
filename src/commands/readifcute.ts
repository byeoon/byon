import { Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const readifCute: Command = {
  name: "readifcute",
  description: "read if cute",
  category: ShoukoCommandCategory.Fun,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  run: async (_client: Client, interaction: ShoukoHybridCommand) => { 
    await interaction.reply({
      content: "read if cute <a:shiggie:1347797041174020189>"
    })
  }
}