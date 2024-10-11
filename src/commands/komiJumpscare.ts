import { ApplicationIntegrationType, Client, CommandInteraction, InteractionContextType } from "discord.js"
import { Command, UniversalContextType, UniversalIntegrationType } from "../commons/command"
import { getConfigValue } from "../events/errorDebugger"

export const komiJumpscare: Command = {
    name: "jumpscare_me_onegaishimasu",
    description: '"Please jumpscare me, thank you", You said.',
    integrationTypes: UniversalIntegrationType,
    contexts: UniversalContextType,
    run: async (client: Client, interaction: CommandInteraction) => {
        await interaction.reply({
            content: getConfigValue("JUMPSCARE_GIFS")[Math.floor(Math.random() * getConfigValue("JUMPSCARE_GIFS").length)]
        })
    }
}