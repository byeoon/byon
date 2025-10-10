import { Client } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command";

export const ping: Command = {
  name: "ping",
  description: "Pong! 🏓",
  category: ShoukoCommandCategory.Misc,
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (client: Client, interaction: ShoukoHybridCommand) => {
    let startTime = Date.now();
    await interaction.deferReply({
      ephemeral: (false)
    });
    
    let latency =  Date.now() - startTime;
    let ws_latency = client.ws.ping;
  
    await interaction.followUp({
      content: `Pong! 🏓 My ping is ${latency}ms and my websocket ping is ${ws_latency}ms.`
    })
  }
}