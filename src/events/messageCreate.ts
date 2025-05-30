import { ApplicationCommandOptionData, ChannelType, Client, EmbedBuilder, Message, TextChannel } from "discord.js";
import { chatBot } from "../commons/aiwrapper";
import { getConfigValue, logger, makeErrorMessage } from "./errorDebugger";
import { Commands } from "../commands";
import { ShoukoHybridCommand } from "../commons/command";
import { prefix } from "..";
import { getGuildVars } from "../commons/dbManager";

const respond = async (message: Message<boolean>) => {
  let res: string;
  let embeds: EmbedBuilder[] = [];

  let query: string = message.cleanContent;
  
  if (message.cleanContent.toLowerCase().startsWith("shouko")) {
    query = message.cleanContent.slice('shouko'.length);
  }
  
  await (message.channel as TextChannel).sendTyping();

  try {
    res = await chatBot(query, message.author);
  } catch (err: any) {
    res = makeErrorMessage(err);
  }

  if (res.length > 2000) {
    let replyEmbed = new EmbedBuilder()
    .setColor(getConfigValue("EMBED_COLOR"))
    .setDescription(res);
    embeds.push(replyEmbed);
  }

  await message.reply({
    embeds: embeds,
    content: res.length > 2000 ? undefined : res
  });
}

export default async (client: Client) => {
  client.on("messageCreate", async (message: Message<boolean>) => {
    if (message.author.id === client.user!.id) return 
    switch(message.channel.type) {
      case ChannelType.DM:
        if ((getConfigValue("WHITELISTED_USERS") as Array<string>).includes(message.author.id)) {
          await respond(message);
        }
      break;
      default:
        if (message.inGuild()) {
          if (!message.cleanContent.startsWith(prefix) && (message.cleanContent.toLowerCase().startsWith("shouko") || (await getGuildVars(message.guild.id, "AIChannelIds") as Array<string>).includes(message.channelId))) {
            if (!(getConfigValue("WHITELISTED_GUILDS") as Array<string>).includes(message.guild.id))
              return await message.reply({ content: (getConfigValue("NOT_WHITELISTED_MESSAGES") as Array<string>)[Math.floor((getConfigValue("NOT_WHITELISTED_MESSAGES") as Array<string>).length * Math.random())]});
            await respond(message);
          }
        }
      break;
    }

    if (message.cleanContent.startsWith(prefix)) {
      let interaction = new ShoukoHybridCommand(client, message, [])
      const _command = Commands.find(c => c.name === interaction.commandName)
      if (!_command) {
        await interaction.reply({ content: "Error: `Command not found`" });
        return;
      } else {
        try {
          let interaction = new ShoukoHybridCommand(client, message, _command.options as ApplicationCommandOptionData[])
          await _command.run(client, interaction)
        } catch (err: any) {
          logger ("[SlashCommands] " + err)
          await interaction.reply({
            content: makeErrorMessage(err)
          })
        }
        return;
      }
    }
  })
}