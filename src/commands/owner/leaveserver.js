/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "leaveserver",
  description: "salir de un servidor.",
  category: "OWNER",
  botPermissions: ["EmbedLinks"],
  command: {
    enabled: true,
    minArgsCount: 1,
    usage: "<serverId>",
  },
  slashCommand: {
    enabled: false,
  },

  async messageRun(message, args, data) {
    const input = args[0];
    const guild = message.client.guilds.cache.get(input);
    if (!guild) {
      return message.safeReply(
        `No se encontró el servidor. Por favor, proporciona una ID de servidor válida.
        Puedes usar ${data.prefix}findserver/${data.prefix}listservers para encontrar la ID del servidor`
      );
    }

    const name = guild.name;
    try {
      await guild.leave();
      return message.safeReply(`Saliste exitosamente de \`${name}\``);
    } catch (err) {
      message.client.logger.error("GuildLeave", err);
      return message.safeReply(`No se pudo salir de \`${name}\``);
    }
  },
};
