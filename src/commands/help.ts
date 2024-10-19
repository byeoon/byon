import { ActionRowBuilder, ApplicationCommandOptionData, ApplicationCommandOptionType, AutocompleteInteraction, BaseApplicationCommandOptionsData, ButtonBuilder, ButtonStyle, Client, ComponentType, EmbedBuilder, Message, MessageComponentInteraction } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, TranslateApplicationCommandOptionType, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { Commands } from "../commands";
import { getConfigValue} from "../events/errorDebugger";
import { prefix, shoukoVersion } from "..";
import { filterEmojis } from "../commons/aiwrapper";

const generateHelpMessage = async (interaction: ShoukoHybridCommand, currentPage: number, category?: string, selectedCommand?: Command ): Promise<Message<boolean>> => {
  let maxPages: number = Object.keys(ShoukoCommandCategory).length;
  let embed = new EmbedBuilder()
  .setColor(getConfigValue("EMBED_COLOR"))
  .setTitle("shouko's help page")
  .setFooter({
    text: 'shouko v' + shoukoVersion
  });

  if (!category) category = "General"; 
  let shownPrefix = interaction.isMessageBased() ? prefix : "/";

  const buttonRow = new ActionRowBuilder<ButtonBuilder>();
  if (!selectedCommand) {
    let _Commands = []
    Commands.map((command: Command) => {
      if (command.category === Object.keys(ShoukoCommandCategory)[currentPage]) {
        var commandOptionText: string = "";
        command.options?.map((option: ApplicationCommandOptionData) => {
          commandOptionText += `| \`${option.name}:${(TranslateApplicationCommandOptionType as any)[option.type].toLowerCase()}\` `
        });

        embed.addFields({
          name: shownPrefix + command.name + ' ' + commandOptionText,
          value: command.description
        });

        _Commands.push(command);
      }
    });

    embed.setDescription(`Listing **${_Commands.length} available** commands (total of ${Commands.length})\nMade with **<3** by [specifix](<https://specifix.dev/>)\n### Category: ${Object.keys(ShoukoCommandCategory)[currentPage]}`)

    const leftButton = new ButtonBuilder()
    .setCustomId("leftButton_" + interaction.id)
    .setEmoji("<:arrowleft:1295005062359154708>")
    .setLabel(currentPage > 0 ? "Previous: " + Object.keys(ShoukoCommandCategory)[currentPage - 1] : " ")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage <= 0);
    buttonRow.addComponents(leftButton)

    const rightButton = new ButtonBuilder()
    .setCustomId("rightButton_" + interaction.id)
    .setLabel(currentPage < maxPages - 1 ? "Next: " + Object.keys(ShoukoCommandCategory)[currentPage + 1] : " ")
    .setEmoji("<:arrowright:1295001638544736256>")
    .setStyle(ButtonStyle.Primary)
    .setDisabled(currentPage >= maxPages - 1)
    buttonRow.addComponents(rightButton)

  } else {
    var commandOptionText: string = "";
    var commandOptionDescriptor: string = "";
    selectedCommand.options?.map((option: ApplicationCommandOptionData) => {
      commandOptionText += `| ${option.name}:${(TranslateApplicationCommandOptionType as any)[option.type].toLowerCase()} `
      commandOptionDescriptor += `- \`${option.name} (${(TranslateApplicationCommandOptionType as any)[option.type].toLowerCase()})\` ${(option as BaseApplicationCommandOptionsData).required ? "" : "| **(OPTIONAL)**"}\n   ${option.description}\n`
    })

    embed
    .setTitle("showing command '" + selectedCommand.name.toLowerCase() + "'")
    .setDescription('```' + shownPrefix + selectedCommand.name.toLowerCase() + ' ' + commandOptionText + '```\n' + selectedCommand.description + "\n" + commandOptionDescriptor);
  }

  return await interaction.editReply({
    embeds: [embed],
    content: filterEmojis(getConfigValue("HELP_MESSAGES")[Math.floor(Math.random() * getConfigValue("HELP_MESSAGES").length)]),
    components: selectedCommand ? undefined : [buttonRow]
  });
}

export const HelpCommand: Command = {
  name: 'help',
  description: 'Lists shouko\'s available commands in a (decent) format.. i guess.',
  category: ShoukoCommandCategory.General,
  options: [
    {
      name: "command",
      description: "The specified command for its help page.",
      type: ApplicationCommandOptionType.String,
      autocomplete: true
    },
    {
      name: "ephmeral",
      description: "Incognito mode (only makes the command visible to you)",
      type: ApplicationCommandOptionType.Boolean
    }
  ],
  contexts: UniversalContextType,
  integrationTypes: UniversalIntegrationType,
  run: async (_client: Client, interaction: ShoukoHybridCommand) => {

    await interaction.deferReply({
      ephemeral: (interaction.getOption<boolean>("ephmeral") || false)
    });

    let selectedCommandName: string = interaction.getOption<string>("command") || ""
    let selectedCommand: Command | undefined;
    let response: Message<boolean>;
    let currentPage = 0;

    if (selectedCommandName) {
      selectedCommand = Commands.find(c => c.name === selectedCommandName.toLowerCase());
      if (selectedCommand) {
        response = await generateHelpMessage(interaction, currentPage, selectedCommand.category, selectedCommand);
      } else {
        throw new Error("No matching command found by the name '" + selectedCommandName.toLowerCase() + "'");
      }
    } else {
      response = await generateHelpMessage(interaction, currentPage);
    }

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1_000 * 60 * 15
    });


    collector.on('collect', async (buttonInteraction: MessageComponentInteraction) => {
      if (buttonInteraction.user.id === interaction.user.id && buttonInteraction.customId.endsWith(interaction.id)) {
        if (buttonInteraction.customId.startsWith("leftButton")) {
          if (currentPage > 0) {
            currentPage -= 1
            await generateHelpMessage(interaction, currentPage)
          }
        } else if (buttonInteraction.customId.startsWith("rightButton")) {
          if (currentPage < Object.keys(ShoukoCommandCategory).length - 1) {
            currentPage += 1
            await generateHelpMessage(interaction, currentPage)
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
  },
  autocomplete: async (_client: Client, interaction: AutocompleteInteraction) => {
    const focusedOption = interaction.options.getFocused(true);
		let choices: string[] = [];

    switch (focusedOption.name) {
      case 'command':
        choices = Commands.map(c => c.name);
      break;
    }

    const filtered = choices.filter(choice => choice.startsWith(focusedOption.value));
    await interaction.respond(
        filtered.map(choice => ({ name: choice, value: choice })),
    );
  }
}