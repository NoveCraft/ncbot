/**
 * @param {import('discord.js').GuildMember} miembro
 * @param {string} idMensaje
 */
module.exports = async (miembro, idMensaje) => {
  if (!idMensaje) return "Debes proporcionar un id de mensaje válido.";

  // Permisos
  if (!miembro.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos de gestionar mensajes para finalizar sorteos.";
  }

  // Buscar con idMensaje
  const sorteo = miembro.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === idMensaje && g.guildId === miembro.guild.id
  );

  // Si no se encontró ningún sorteo
  if (!sorteo) return `No se pudo encontrar un sorteo para el idMensaje: ${idMensaje}`;

  // Verificar si el sorteo ha terminado
  if (sorteo.ended) return "El sorteo ya ha terminado.";

  try {
    await sorteo.end();
    return "¡Éxito! ¡El sorteo ha terminado!";
  } catch (error) {
    miembro.client.logger.error("Finalizar Sorteo", error);
    return `Ocurrió un error al finalizar el sorteo: ${error.message}`;
  }
};
