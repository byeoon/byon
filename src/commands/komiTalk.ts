import { ApplicationCommandOptionType, Client, EmbedBuilder } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { chatBot } from "../commons/aiwrapper"
import { getConfigValue, logger } from "../events/errorDebugger";

export const komiTalk: Command = {
  name: "talk",
  description: "Talk with shouko, she's a little lonely around here..",
  category: ShoukoCommandCategory.Shouko,
  options: [
    {
      name: "say",
      type: ApplicationCommandOptionType.String,
      description: "This will be the text she receives, say something! 早く 早く!!!!",
      required: true
    },
    {
      name: "ephmeral",
      type: ApplicationCommandOptionType.Boolean,
      description: "Incognito mode (only makes the command visible to you)",
      required: false
    }
  ],
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (_client: Client, interaction: ShoukoHybridCommand) => {
    let res: string
    let embedsToSend: EmbedBuilder[] = []
    let shouldEphmeral: boolean = interaction.getOption<boolean>("ephmeral") || false;

    await interaction.deferReply({ephemeral: shouldEphmeral});
    res = await chatBot(interaction.getOption<string>("say")!, interaction.user);

    let replyEmbed = new EmbedBuilder()
    .setDescription(interaction.getOption<string>("say")!)
    .setAuthor({
      iconURL: interaction.user.avatarURL({
        size: 128
      }) as string,
      name: interaction.user.username + " said:"
    })
    .setColor(getConfigValue("EMBED_COLOR"));

    let responseEmbed = new EmbedBuilder()
    .setDescription(res);

    if (res.length > 2000) embedsToSend.push(responseEmbed);
    embedsToSend.push(replyEmbed);

    await interaction.followUp({embeds: embedsToSend, content: res.length > 2000 ? undefined : res + "** **", ephemeral: shouldEphmeral}).catch(err => logger (err));
  }
}