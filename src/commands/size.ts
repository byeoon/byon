import { ApplicationCommandOptionType, Client } from "discord.js"
import { Command, ShoukoCommandCategory, ShoukoHybridCommand, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const size: Command = {
    name: "size",
    description: "You know what it means.",
    category: ShoukoCommandCategory.Fun,
    integrationTypes: UniversalIntegrationType,
    contexts: UniversalContextType,
    options: [
        {
            name: "user",
            description: "who do you want to evaluate (broken rn)",
            type: ApplicationCommandOptionType.User,
            required: false
        }
    ],
    run: async (_client: Client, interaction: ShoukoHybridCommand) => {
            let length = Math.floor(Math.random() * 12) + 1;
            let thepp: string = "="
           for (let i = 0; i < length; i++) {
                thepp += "="
            }
        await interaction.reply({
            content: "Your size is: 8" + thepp + "D"
        })
    }
}