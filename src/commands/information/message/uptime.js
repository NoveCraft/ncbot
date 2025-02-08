const { timeformat } = require("@helpers/Utils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "tiempoactivo",
  description: "te da el tiempo activo del bot",
  category: "INFORMACIÓN",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
  },

  async messageRun(message, args) {
    await message.safeReply(`Mi tiempo activo: \`${timeformat(process.uptime())}\``);
  },
};
