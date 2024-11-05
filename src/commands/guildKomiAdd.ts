import { ApplicationCommandOptionType, Client } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand } from "../commons/command";
import { getGuildVars, setGuildVars } from "../commons/dbManager";
import { getConfigValue } from "../events/errorDebugger";

export const guildKomiChannelAdd: Command = {
  name: "addchatchannel",
  description: "makes shouko respond to all messages in a channel, without 'shouko <text>'",
  category: ShoukoCommandCategory.Shouko,
  options: [
    {
      name: "channelid",
      description: "The channel id to be added", // TODO: ADD CHANNEL ARGUMENT TYPE
      type: ApplicationCommandOptionType.String,
      required: true
    },
    {
      name: "ephmeral",
      type: ApplicationCommandOptionType.Boolean,
      description: "Incognito mode (only makes the command visible to you)",
      required: false
    }
  ],
  run: async (_client: Client, interaction: ShoukoHybridCommand) => {
    if (interaction.isChatInput()) await interaction.deferReply({ ephemeral: interaction.getOption<boolean>("ephmeral") || false});
    if (!interaction.inGuild()) return await interaction.followUp({ content: "You must be in a guild to use this command!" });
    if (!(interaction.getMember()?.permissions.has("ManageChannels") || (getConfigValue("DEV_USERS") as Array<string>).includes(interaction.user.id))) throw new Error("You are missing the permission 'ManageChannels'");
    if (interaction.getOption<string>("channelid")) {
      let channel = await interaction.guild?.channels.fetch(interaction.getOption<string>("channelid") as string);
      if (!channel) return await interaction.followUp({ content: "There's no channel found by that id!" });

      let guildChannelIds: Array<string> = await getGuildVars(interaction.getGuild()!.id, "AIChannelIds");
      guildChannelIds.push(channel.id);
      await setGuildVars(interaction.getGuild()!.id, "AIChannelIds", guildChannelIds);

      await interaction.followUp({ content: "Added channel <#" + channel.id + "> to shouko's channels!\n-# You can now talk to without talk command in the added channel."});
    } else {
      throw new Error ("No channel id provided")
    }
  }
}