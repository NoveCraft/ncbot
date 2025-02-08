/**
 * @param {import('discord.js').GuildMember} miembro
 * @param {string} idMensaje
 */
module.exports = async (miembro, idMensaje) => {
  if (!idMensaje) return "Debes proporcionar un id de mensaje válido.";

  // Permisos
  if (!miembro.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos de gestionar mensajes para iniciar sorteos.";
  }

  // Buscar con idMensaje
  const sorteo = miembro.client.giveawaysManager.giveaways.find(
    (s) => s.messageId === idMensaje && s.guildId === miembro.guild.id
  );

  // Si no se encontró ningún sorteo
  if (!sorteo) return `No se pudo encontrar un sorteo para el idMensaje: ${idMensaje}`;

  // Verificar si el sorteo ha terminado
  if (!sorteo.ended) return "El sorteo aún no ha terminado.";

  try {
    await sorteo.reroll();
    return "¡Sorteo re-rolado!";
  } catch (error) {
    miembro.client.logger.error("Re-rolar Sorteo", error);
    return `Ocurrió un error al re-rolar el sorteo: ${error.message}`;
  }
};
