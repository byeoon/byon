import { ActionRowBuilder, ApplicationCommandOptionType, ButtonBuilder, ButtonStyle, Client, CommandInteraction, ComponentType, EmbedBuilder, InteractionCollector, InteractionResponse, Message, MessageComponentInteraction } from "discord.js";
import { Command, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { loadChatHistory } from "../commons/dbManager";
import { Content } from "@google/generative-ai";
import { getConfigValue } from "../events/errorDebugger";
import { shoukoVersion } from "..";
import { filterEmojis } from "../commons/aiwrapper";

export const truncateString = (str: string, maxLength: number): string => {
  if (str.length > maxLength) {
      return str.slice(0, maxLength - 3) + '...';
  }
  return str;
}

const sanitizer = (text: string): string => {
  return truncateString(text
  .replace(/(\p{EPres}|\p{ExtPict})(\u200d(\p{EPres}|\p{ExtPict}))*/gu, "")
  .replace(/([!-\+;-@[-`])|(\r\n|\r|\n)+/g, "")
  .replace(/( [\s]+|[\s]+$)+/g, " ")
  .replace(":3", ":>")
  .trim(), 105);
}

const splitMessagesIntoChunks = (array: Array<string>, chunkSize: number): Array<Array<string>> => {
  const result: Array<Array<string>> = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    result.push(array.slice(i, i + chunkSize));
  }
  return result;
}

const createHistoryMessage = async (contents: Array<string>, interaction: CommandInteraction, currentPage: number, maxPages: number): Promise<Message<boolean>> => {
  const historyEmbed = new EmbedBuilder()
  .setTitle(`chat history [showing ${currentPage + 1}/${maxPages}]`)
  .setDescription("(displayed in a descending order)\n```prolog\n" + (contents.length > 0 ? contents.join("\n") : "No Chat History Recorded") + "```")
  .setColor(getConfigValue("EMBED_COLOR"))
  .setFooter({
    text: 'shouko v' + shoukoVersion
  });

  const buttonRow = new ActionRowBuilder<ButtonBuilder>();
  const leftButton = new ButtonBuilder()
  .setCustomId("leftButton_" + interaction.id)
  .setEmoji("<:arrowleft:1295005062359154708>")
  .setLabel(currentPage > 0 ? "Previous page" : " ")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(currentPage <= 0);
  buttonRow.addComponents(leftButton)

  const rightButton = new ButtonBuilder()
  .setCustomId("rightButton_" + interaction.id)
  .setLabel(currentPage < maxPages - 1 ? "Next page" : " ")
  .setEmoji("<:arrowright:1295001638544736256>")
  .setStyle(ButtonStyle.Primary)
  .setDisabled(currentPage >= maxPages - 1)
  buttonRow.addComponents(rightButton)

  return await interaction.editReply({
    embeds: [historyEmbed],
    content: filterEmojis(getConfigValue("CHAT_HISTORY_MESSAGES")[Math.floor(Math.random() * getConfigValue("CHAT_HISTORY_MESSAGES").length)]),
    components: [buttonRow]
  });
}

export const komiHistory: Command = {
  name: "show_my_chat_history",
  description: "Shows your previous messages with shouko in a (decent) formatted list.",
  options: [
    {
      name: "no_ephmeral",
      description: "No Incognito mode (Makes the response visible to everyone)",
      type: ApplicationCommandOptionType.Boolean
    }
  ],
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (client: Client, interaction: CommandInteraction) => {
    await interaction.deferReply({ ephemeral: !interaction.options.get("no_ephmeral")?.value});
    let chatHistory = await loadChatHistory(interaction.user.id);
    let rChatHistory = chatHistory.slice().reverse();

    let contents = rChatHistory.map((Content: Content, index: number) => 
      `${
        Content.role.replace("user", "You   ").replace("model", "Shouko")
    } ${
        sanitizer(Content.parts[0].text!.toLowerCase())
    }`);

    let pages = splitMessagesIntoChunks(contents, 10);
    let currentPage: number = 0;

    const response = await createHistoryMessage(pages[0] ?? [], interaction, currentPage, pages.length <= 0 ? 1 : pages.length);

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1_000 * 60 * 15
    });


    collector.on('collect', async (buttonInteraction: MessageComponentInteraction) => {
      if (buttonInteraction.user.id === interaction.user.id && buttonInteraction.customId.endsWith(interaction.id)) {
        if (buttonInteraction.customId.startsWith("leftButton")) {
          if (currentPage > 0) {
            currentPage -= 1
            await createHistoryMessage(pages[currentPage] ?? [], interaction, currentPage, pages.length <= 0 ? 1 : pages.length)
          }
        } else if (buttonInteraction.customId.startsWith("rightButton")) {
          if (currentPage < pages.length - 1) {
            currentPage += 1
            await createHistoryMessage(pages[currentPage] ?? [], interaction, currentPage, pages.length <= 0 ? 1 : pages.length)
          }
        }

        await buttonInteraction.deferUpdate();
      } else if (buttonInteraction.user.id !== interaction.user.id) {
        await buttonInteraction.reply({content: 
          filterEmojis(getConfigValue("INTERACTION_NOT_ALLOWED_MESSAGES")[Math.floor(Math.random() * getConfigValue("INTERACTION_NOT_ALLOWED_MESSAGES").length)]), 
          ephemeral: true
        });
      }
    })
  }
}