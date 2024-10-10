import { ApplicationIntegrationType, Client, CommandInteraction, InteractionContextType } from "discord.js"
import { Command, UniversalContextType, UniversalIntegrationType } from "../commons/command"

export const komiJumpscare: Command = {
    name: "jumpscare_me_onegaishimasu",
    description: '"Please jumpscare me, thank you", You said.',
    integrationTypes: UniversalIntegrationType,
    contexts: UniversalContextType,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.reply({
            content: "https://cdn.discordapp.com/attachments/1147843031077228564/1293572523514003506/mikushow.png?ex=6707dccb&is=67068b4b&hm=8cbeaa872899a3a14b41941c1e317d8b5aeefe6c1495d3b4ca0b9c6feaf4d7cc&"
        })
    }
}