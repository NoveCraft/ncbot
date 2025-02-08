const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgaradjunto",
  description: "elimina la cantidad especificada de mensajes con archivos adjuntos",
  category: "MODERACIÓN",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "[cantidad]",
    aliases: ["purgaradjunto", "purgaradjuntos"],
  },

  async messageRun(message, args) {
    const cantidad = args[0] || 99;

    if (cantidad) {
      if (isNaN(cantidad)) return message.safeReply("Solo se permiten números");
      if (parseInt(cantidad) > 99) return message.safeReply("La cantidad máxima de mensajes que puedo eliminar es 99");
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, message.channel, "ATTACHMENT", cantidad);

    if (typeof response === "number") {
      return channel.safeSend(`Se eliminaron exitosamente ${response} mensajes`, 5);
    } else if (response === "BOT_PERM") {
      return message.safeReply("No tengo permisos de `Leer el historial de mensajes` y `Gestionar mensajes` para eliminar mensajes", 5);
    } else if (response === "MEMBER_PERM") {
      return message.safeReply("No tienes permisos de `Leer el historial de mensajes` y `Gestionar mensajes` para eliminar mensajes", 5);
    } else if (response === "NO_MESSAGES") {
      return channel.safeSend("No se encontraron mensajes que se puedan limpiar", 5);
    } else {
      return message.safeReply(`¡Ocurrió un error! No se pudieron eliminar los mensajes`);
    }
  },
};
