const { ChannelType } = require("discord.js");

/**
 * @param {import('discord.js').GuildMember} miembro
 * @param {import('discord.js').GuildTextBasedChannel} canalSorteo
 * @param {number} duracion
 * @param {string} premio
 * @param {number} ganadores
 * @param {import('discord.js').User} [anfitrion]
 * @param {string[]} [rolesPermitidos]
 */
module.exports = async (miembro, canalSorteo, duracion, premio, ganadores, anfitrion, rolesPermitidos = []) => {
  try {
    if (!anfitrion) anfitrion = miembro.user;
    if (!miembro.permissions.has("ManageMessages")) {
      return "Necesitas tener permisos para gestionar mensajes para iniciar sorteos.";
    }

    if (!canalSorteo.type === ChannelType.GuildText) {
      return "Solo puedes iniciar sorteos en canales de texto.";
    }

    /**
     * @type {import("discord-giveaways").GiveawayStartOptions}
     */
    const opciones = {
      duration: duracion,
      prize: premio,
      winnerCount: ganadores,
      hostedBy: anfitrion,
      thumbnail: "https://i.imgur.com/DJuTuxs.png",
      messages: {
        giveaway: "🎉 **SORTEO** 🎉",
        giveawayEnded: "🎉 **SORTEO TERMINADO** 🎉",
        inviteToParticipate: "Reacciona con 🎁 para participar",
        dropMessage: "¡Sé el primero en reaccionar con 🎁 para ganar!",
        hostedBy: `\nOrganizado por: ${anfitrion.username}`,
      },
    };

    if (rolesPermitidos.length > 0) {
      opciones.exemptMembers = (miembro) => !miembro.roles.cache.find((rol) => rolesPermitidos.includes(rol.id));
    }

    await miembro.client.giveawaysManager.start(canalSorteo, opciones);
    return `Sorteo iniciado en ${canalSorteo}`;
  } catch (error) {
    miembro.client.logger.error("Inicio de Sorteo", error);
    return `Ocurrió un error al iniciar el sorteo: ${error.message}`;
  }
};
