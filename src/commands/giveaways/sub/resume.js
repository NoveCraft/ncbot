/**
 * @param {import('discord.js').GuildMember} miembro
 * @param {string} idMensaje
 */
module.exports = async (miembro, idMensaje) => {
  if (!idMensaje) return "Debes proporcionar un id de mensaje válido.";

  // Permisos
  if (!miembro.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos de gestionar mensajes para administrar sorteos.";
  }

  // Buscar con idMensaje
  const sorteo = miembro.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === idMensaje && g.guildId === miembro.guild.id
  );

  // Si no se encontró ningún sorteo
  if (!sorteo) return `No se pudo encontrar un sorteo para el idMensaje: ${idMensaje}`;

  // Verificar si el sorteo está pausado
  if (!sorteo.pauseOptions.isPaused) return "Este sorteo no está pausado.";

  try {
    await sorteo.unpause();
    return "¡Éxito! ¡Sorteo reanudado!";
  } catch (error) {
    miembro.client.logger.error("Reanudar Sorteo", error);
    return `Ocurrió un error al reanudar el sorteo: ${error.message}`;
  }
};
