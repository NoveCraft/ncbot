const informacionDelServidor = require("../shared/guild");

/**
 * @type {import("@structures/Command")}
 */
module.exports = {
  nombre: "informaciondelservidor",
  descripcion: "muestra información sobre el servidor",
  categoria: "INFORMACIÓN",
  permisosDelBot: ["EmbedLinks"],
  cooldown: 5,
  comando: {
    habilitado: true,
    alias: ["informaciondelaserver"],
  },

  async ejecutarMensaje(mensaje, args) {
    const respuesta = await informacionDelServidor(mensaje.guild);
    await mensaje.safeReply(respuesta);
  },
};
