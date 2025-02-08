/**
 * @param {import('discord.js').GuildMember} miembro
 * @param {string} idMensaje
 */
module.exports = async (miembro, idMensaje) => {
  if (!idMensaje) return "Debes proporcionar un id de mensaje válido.";

  // Permisos
  if (!miembro.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos de gestionar mensajes para gestionar sorteos.";
  }

  // Buscar con idMensaje
  const sorteo = miembro.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === idMensaje && g.guildId === miembro.guild.id
  );

  // Si no se encontró ningún sorteo
  if (!sorteo) return `No se pudo encontrar un sorteo para el id de mensaje: ${idMensaje}`;

  // Verificar si el sorteo está pausado
  if (sorteo.pauseOptions.isPaused) return "Este sorteo ya está pausado.";

  try {
    await sorteo.pause();
    return "¡Éxito! ¡Sorteo pausado!";
  } catch (error) {
    miembro.client.logger.error("Pausa de Sorteo", error);
    return `Ocurrió un error al pausar el sorteo: ${error.message}`;
  }
};
