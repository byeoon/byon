import { ApplicationCommandOptionType, Client } from "discord.js";
import { Command, ShoukoCommandCategory, ShoukoHybridCommand } from "../commons/command";
import { setGuildVars } from "../commons/dbManager";
import { getConfigValue } from "../events/errorDebugger";

export const guildKomiChannelDel: Command = {
  name: "removechatchannel",
  description: "remove shouko's chat channels in this server.",
  category: ShoukoCommandCategory.Shouko,
  options: [
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

    await setGuildVars(interaction.getGuild()!.id, "AIChannelIds", []);
    await interaction.followUp({content: "Successfully **removed** all my chat channels in this server."})
  }
}