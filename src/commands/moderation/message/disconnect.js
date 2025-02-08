const desconectar = require("../shared/disconnect");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "desconectar",
  descripcion: "desconectar a un miembro especificado del canal de voz",
  categoria: "MODERACION",
  permisosUsuario: ["MuteMembers"],
  comando: {
    habilitado: true,
    uso: "<ID|@miembro> [razón]",
    minArgsCount: 1,
  },

  async ejecutarMensaje(mensaje, args) {
    const objetivo = await mensaje.guild.resolveMember(args[0], true);
    if (!objetivo) return mensaje.safeReply(`No se encontró ningún usuario que coincida con ${args[0]}`);
    const razon = mensaje.content.split(args[0])[1].trim();
    const respuesta = await desconectar(mensaje, objetivo, razon);
    await mensaje.safeReply(respuesta);
  },
};
