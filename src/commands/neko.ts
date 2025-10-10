import { ApplicationCommandOptionType,  Client, EmbedBuilder } from "discord.js"
import { APIActionResult, Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger";

export const neko: Command = {
  name: "neko",
  description: "catgirls!",
  category: ShoukoCommandCategory.Misc,
  integrationTypes: UniversalIntegrationType,
  contexts: UniversalContextType,
  options: [
    {
        name: "ephmeral",
        description: "Have the message appear in chat",
        type: ApplicationCommandOptionType.Boolean,
    },
  ],
  run: async (_client: Client, interaction: ShoukoHybridCommand) => { 
    const BASE_URLS = {
      ACTIONS: "https://nekos.best/api/v2/",
    };
    
    const req = await fetch(new URL("neko", BASE_URLS.ACTIONS));
    const { results: [{ url }] } = (await req.json()) as APIActionResult;

      const pingEmbed = new EmbedBuilder()
      .setTitle("Here's a neko for you!")
      .setImage(url)
      .setFooter({
        text: 'Source: ' + BASE_URLS.ACTIONS
      })
      .setColor(getConfigValue("EMBED_COLOR"));

    await interaction.reply({
      embeds: [pingEmbed],
      ephemeral: interaction.getOption<boolean>("ephmeral") ?? false
    })
  }
}
