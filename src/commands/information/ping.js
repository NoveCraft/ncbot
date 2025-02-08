/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "ping",
  description: "muestra el ping actual del bot a los servidores de discord",
  category: "INFORMACIÓN",
  command: {
    enabled: true,
  },
  slashCommand: {
    enabled: true,
    ephemeral: true,
    options: [],
  },

  async messageRun(message, args) {
    await message.safeReply(`🏓 Pong : \`${Math.floor(message.client.ws.ping)}ms\``);
  },

  async interactionRun(interaction) {
    await interaction.followUp(`🏓 Pong : \`${Math.floor(interaction.client.ws.ping)}ms\``);
  },
};
