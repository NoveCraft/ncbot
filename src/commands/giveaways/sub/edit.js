/**
 * @param {import('discord.js').GuildMember} miembro
 * @param {string} idMensaje
 * @param {number} agregarDuracion
 * @param {string} nuevoPremio
 * @param {number} nuevaCantidadGanadores
 */
module.exports = async (miembro, idMensaje, agregarDuracion, nuevoPremio, nuevaCantidadGanadores) => {
  if (!idMensaje) return "Debes proporcionar un id de mensaje válido.";

  // Permisos
  if (!miembro.permissions.has("ManageMessages")) {
    return "Necesitas tener permisos de gestionar mensajes para iniciar sorteos.";
  }

  // Buscar con idMensaje
  const sorteo = miembro.client.giveawaysManager.giveaways.find(
    (g) => g.messageId === idMensaje && g.guildId === miembro.guild.id
  );

  // Si no se encontró ningún sorteo
  if (!sorteo) return `No se pudo encontrar un sorteo para el idMensaje: ${idMensaje}`;

  try {
    await miembro.client.giveawaysManager.edit(idMensaje, {
      addTime: agregarDuracion || 0,
      newPrize: nuevoPremio || sorteo.prize,
      newWinnerCount: nuevaCantidadGanadores || sorteo.winnerCount,
    });

    return `¡Sorteo actualizado con éxito!`;
  } catch (error) {
    miembro.client.logger.error("Editar Sorteo", error);
    return `Ocurrió un error al actualizar el sorteo: ${error.message}`;
  }
};
