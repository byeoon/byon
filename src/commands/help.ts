import { ApplicationCommandOptionData, ApplicationCommandOptionType, AutocompleteInteraction, BaseApplicationCommandOptionsData, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { Command, TranslateApplicationCommandOptionType, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { Commands } from "../commands";
import { getConfigValue, makeErrorMessage } from "../events/errorHandler";
import { shoukoVersion } from "..";

export const HelpCommand: Command = {
    name: 'help',
    description: 'Lists shouko\'s available commands in a (decent) format.. i guess.',
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
    run: async (client: Client, interaction: CommandInteraction) => {
        let helpEmbed: EmbedBuilder = new EmbedBuilder()
        .setColor(getConfigValue("EMBED_COLOR"))
        .setFooter({
            text: 'shouko v' + shoukoVersion
        });
        let errored: boolean = false;
        let res: string = "";
        let selectedCommandName: string = interaction.options.get("command") ? interaction.options.get("command")?.value as string : ""
        let selectedCommand: Command | undefined;
        try {
            if (selectedCommandName) {
                selectedCommand = Commands.find(c => c.name === selectedCommandName.toLowerCase())
                if (selectedCommand) {
                    var commandOptionText: string = "";
                    var commandOptionDescriptor: string = "";
                    var listOptions = selectedCommand.options?.map((option: ApplicationCommandOptionData) => {
                        commandOptionText += `| ${option.name}:${(TranslateApplicationCommandOptionType as any)[option.type].toLowerCase()} `
                        commandOptionDescriptor += `- \`${option.name} (${(TranslateApplicationCommandOptionType as any)[option.type].toLowerCase()})\` ${(option as BaseApplicationCommandOptionsData).required ? "" : "| **(OPTIONAL)**"}\n   ${option.description}\n`
                    })

                    helpEmbed
                    .setTitle("showing command '" + selectedCommandName.toLowerCase() + "'")
                    .setDescription('```/' + selectedCommandName.toLowerCase() + ' ' + commandOptionText + '```\n' + selectedCommand.description + "\n" + commandOptionDescriptor)
                } else {
                    throw new Error("No matching command found by the name '" + selectedCommandName.toLowerCase() + "'")
                }
            } else {
                helpEmbed
                .setTitle("shouko's help page")
                .setDescription(`Listing **${Commands.length} available commands.**\nMade with **<3** by [specifix](<https://specifix.dev/>)`)
                Commands.map((command: Command) => {
                    var commandOptionText: string = "";
                    var commandOptionDescriptor: string = "";
                    var listOptions = command.options?.map((option: ApplicationCommandOptionData) => {
                        commandOptionText += `| \`${option.name}:${(TranslateApplicationCommandOptionType as any)[option.type].toLowerCase()}\` `
                    })
                    helpEmbed.addFields({
                        name: '/' + command.name + ' ' + commandOptionText,
                        value: command.description
                    })
                });
            }
        } catch (err: any) {
            errored = true;
            res = makeErrorMessage(err);
        }

        await interaction.reply({
            content: errored ? res : undefined,
            embeds: errored ? undefined : [helpEmbed], 
            ephemeral: (interaction.options.get("ephmeral")?.value != undefined ? 
                interaction.options.get("ephmeral")?.value as boolean : 
                false) || errored
        })
    },
    autocomplete: async (client: Client, interaction: AutocompleteInteraction) => {
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