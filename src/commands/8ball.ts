import { ApplicationCommandOptionType, Client, EmbedBuilder } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger";

export const eightball: Command = {
    name: "8ball",
    description: "What will the mystical 8-ball tell you today?",
    category: ShoukoCommandCategory.Fun,
    integrationTypes: UniversalIntegrationType,
    contexts: UniversalContextType,
    options: [
        {
            name: "question",
            description: "What do you want to ask?",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    run: async (_client: Client, interaction: ShoukoHybridCommand) => {
        const responses = [
            "403: I am forbidden to respond right now (i just dont feel like it hehe)",
            "500: ''Internal'' error, ask again later.. (ask again later)",
            "An error occured. If this issue persists please contactu s through our help center at help.openai.com :3",
            "Yes, most definitely!",
            "Hell no",
            "Perchance...",
            "There's a good chance",
            "Personally, I wouldn't count on it",
            "Maybe!",
            "um uh yeaaaaa actually no"
        ]
        const replye =(responses as Array<string>)[Math.floor((responses as Array<string>).length * Math.random())]


        const embed = new EmbedBuilder()
            .addFields(
                {
                    name: "Your Question",
                    value: `${interaction.getOption<string>("question")?.toString()}`,
                    inline: true
                },
                {
                    name: "Byon's Response",
                    value: "" + replye,
                    inline: false
                },
            )

            .setColor(getConfigValue("EMBED_COLOR"));

        await interaction.reply({
            content: "",
            embeds: [embed]
        })
    }
}