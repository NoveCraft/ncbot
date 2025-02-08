const { purgeMessages } = require("@helpers/ModUtils");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  name: "purgarusuario",
  description: "elimina la cantidad especificada de mensajes",
  category: "MODERACIÓN",
  userPermissions: ["ManageMessages"],
  botPermissions: ["ManageMessages", "ReadMessageHistory"],
  command: {
    enabled: true,
    usage: "<@usuario|ID> [cantidad]",
    aliases: ["purgarusuarios"],
    minArgsCount: 1,
  },

  async messageRun(message, args) {
    const target = await message.guild.resolveMember(args[0]);
    if (!target) return message.safeReply(`No se encontraron usuarios que coincidan con ${args[0]}`);
    const amount = (args.length > 1 && args[1]) || 99;

    if (amount) {
      if (isNaN(amount)) return message.safeReply("Solo se permiten números");
      if (parseInt(amount) > 99) return message.safeReply("La cantidad máxima de mensajes que puedo eliminar es 99");
    }

    const { channel } = message;
    const response = await purgeMessages(message.member, message.channel, "USER", amount, target);

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
