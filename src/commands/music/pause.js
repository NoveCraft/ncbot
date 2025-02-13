const { musicValidations } = require("@helpers/BotUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "pausa",
  description: "pausar el reproductor de música",
  category: "MÚSICA",
  validations: musicValidations,
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
  },

  async messageRun(message, args) {
    const response = pause(message);
    await message.safeReply(response);
  },

  async interactionRun(interaction) {
    const response = pause(interaction);
    await interaction.followUp(response);
  },
};

/**
 * @param {import("discord.js").CommandInteraction|import("discord.js").Message} arg0
 */
function pause({ client, guildId }) {
  const player = client.musicManager.getPlayer(guildId);
  if (player.paused) return "El reproductor ya está pausado.";

  player.pause(true);
  return "⏸️ Reproductor de música pausado.";
}
