const { EMBED_COLORS } = require("@root/config");

/**
 * @param {import('discord.js').GuildMember} miembro
 */
module.exports = async (miembro) => {
  // Permisos
  if (!miembro.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos para gestionar mensajes para administrar sorteos.";
  }

  // Buscar todos los sorteos
  const sorteos = miembro.client.giveawaysManager.giveaways.filter(
    (g) => g.guildId === miembro.guild.id && g.ended === false
  );

  // No hay sorteos
  if (sorteos.length === 0) {
    return "No hay sorteos en curso en este servidor.";
  }

  const descripcion = sorteos.map((g, i) => `${i + 1}. ${g.prize} en <#${g.channelId}>`).join("\n");

  try {
    return { embeds: [{ descripcion, color: EMBED_COLORS.GIVEAWAYS }] };
  } catch (error) {
    miembro.client.logger.error("Lista de Sorteos", error);
    return `Ocurrió un error al listar los sorteos: ${error.message}`;
  }
};
