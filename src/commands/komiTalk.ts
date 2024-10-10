import { ApplicationCommandOptionType, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { Command, UniversalContextType, UniversalIntegrationType } from "../commons/command";
import { chatBot } from "../commons/aiwrapper"
import { getConfigValue, makeErrorMessage } from "../events/errorHandler";

export const komiTalk: Command = {
    name: "talk",
    description: "Talk with shouko, she's a little lonely around here..",
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
    run: async (client: Client, interaction: CommandInteraction) => {
        let res: string
        let errored: boolean = false;
        let shouldEphmeral: boolean = (interaction.options.get("ephmeral")?.value != undefined ? 
            interaction.options.get("ephmeral")?.value : false) as boolean;

        await interaction.deferReply({ephemeral: shouldEphmeral});
        try {
            res = await chatBot(interaction.options.get("say", true).value as string, interaction.user);
        } catch (err: any) {
            errored = true;
            res = makeErrorMessage(err);
        }

        let replyEmbed = new EmbedBuilder()
        .setDescription(interaction.options.get("say", true).value as string)
        .setAuthor({
            iconURL: interaction.user.avatarURL({
                size: 128
            }) as string,
            name: interaction.user.username + " said:"
        })
        .setColor(getConfigValue("EMBED_COLOR"));
        return await interaction.followUp({embeds: [replyEmbed], content: res, ephemeral: errored || shouldEphmeral});
    }
}