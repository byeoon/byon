import { AutocompleteInteraction, Client, CommandInteraction, Interaction, Message, UserContextMenuCommandInteraction } from "discord.js";
import { Commands, UserCommands } from "../commands";
import { logger, makeErrorMessage } from "./errorDebugger";

const slashCommandHandler = async (client: Client, interaction: CommandInteraction): Promise<void> => {
  const _command = Commands.find(c => c.name === interaction.commandName)
  if (!_command) {
    await interaction.reply("Error: `Command not found`");
    return;
  } else {
    try {
      await _command.run(client, interaction)
    } catch (err: any) {
      logger ("[SlashCommands] " + err)
      if (!interaction.replied) {
        await interaction.reply({
          content: makeErrorMessage(err)
        });
      }
    }
    return;
  }
}

const commandAutocompleteHandler = async (client: Client, interaction: AutocompleteInteraction): Promise<void> => {
  const _command = Commands.find(c => c.name === interaction.commandName)
  if (_command && _command.autocomplete) {
    try {
      await _command.autocomplete(client, interaction)
    } catch (err: any) {
      logger ("[SlashCommands/Autocomplete] " + err)
    }
    return;
  }
}

const commandUserContextHandler = async (client: Client, interaction: UserContextMenuCommandInteraction): Promise<void> => {
  const _command = UserCommands.find(c => c.name === interaction.commandName)
  if (_command) {
    try {
      await _command.run(client, interaction)
    } catch (err: any) {
      logger ("[UserCommands] " + err)
    }
    return;
  }
}

export default (client: Client) => {
  client.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await slashCommandHandler(client, interaction);
    } else if (interaction.isAutocomplete()) {
      await commandAutocompleteHandler(client, interaction);
    } else if (interaction.isUserContextMenuCommand()) {
      await commandUserContextHandler(client, interaction)
    }
  })
}